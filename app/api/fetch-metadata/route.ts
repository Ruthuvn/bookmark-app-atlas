import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type IconCandidate = {
  href: string;
  rel: string;
  sizes: number | null;
  type: string | null;
};

function makeAbsoluteUrl(baseUrl: string, maybeRelativeUrl: string) {
  if (!maybeRelativeUrl) return null;
  if (maybeRelativeUrl.startsWith("data:")) return null;
  try {
    return new URL(maybeRelativeUrl, baseUrl).toString();
  } catch {
    return null;
  }
}

function extractMetaContent(
  html: string,
  selectors: Array<{ attr: "property" | "name"; value: string }>
) {
  for (const selector of selectors) {
    const re = new RegExp(
      `<meta\\s+[^>]*${selector.attr}=["']${selector.value}["'][^>]*content=["']([^"']+)["'][^>]*>`,
      "i"
    );
    const match = html.match(re);
    if (match?.[1]) return match[1];
  }

  for (const selector of selectors) {
    const re = new RegExp(
      `<meta\\s+[^>]*content=["']([^"']+)["'][^>]*${selector.attr}=["']${selector.value}["'][^>]*>`,
      "i"
    );
    const match = html.match(re);
    if (match?.[1]) return match[1];
  }

  return null;
}

function parseSizesToMax(sizesValue: string | null) {
  if (!sizesValue) return null;
  const normalized = sizesValue.trim().toLowerCase();
  if (normalized === "any") return 512;

  const parts = normalized.split(/\s+/g);
  let max = 0;
  for (const part of parts) {
    const m = part.match(/(\d+)x(\d+)/);
    if (!m) continue;
    const w = Number(m[1]);
    const h = Number(m[2]);
    if (Number.isFinite(w) && Number.isFinite(h)) {
      max = Math.max(max, w, h);
    }
  }
  return max > 0 ? max : null;
}

function extractIconCandidates(html: string): IconCandidate[] {
  const candidates: IconCandidate[] = [];
  const linkTagRe = /<link\s+[^>]*>/gi;
  const tags = html.match(linkTagRe) ?? [];

  for (const tag of tags) {
    const relMatch = tag.match(/\brel=["']([^"']+)["']/i);
    const hrefMatch = tag.match(/\bhref=["']([^"']+)["']/i);
    if (!relMatch?.[1] || !hrefMatch?.[1]) continue;

    const rel = relMatch[1].trim().toLowerCase();
    const href = hrefMatch[1].trim();

    if (
      !rel.includes("icon") &&
      rel !== "shortcut icon" &&
      rel !== "apple-touch-icon" &&
      rel !== "apple-touch-icon-precomposed"
    ) {
      continue;
    }

    const sizesMatch = tag.match(/\bsizes=["']([^"']+)["']/i);
    const typeMatch = tag.match(/\btype=["']([^"']+)["']/i);

    candidates.push({
      href,
      rel,
      sizes: parseSizesToMax(sizesMatch?.[1] ?? null),
      type: typeMatch?.[1] ?? null,
    });
  }

  return candidates;
}

function pickBestIconUrl(baseUrl: string, html: string) {
  const candidates = extractIconCandidates(html)
    .map((c) => ({ ...c, absoluteHref: makeAbsoluteUrl(baseUrl, c.href) }))
    .filter((c) => !!c.absoluteHref) as Array<
    IconCandidate & { absoluteHref: string }
  >;

  if (candidates.length === 0) {
    const urlObj = new URL(baseUrl);
    return `${urlObj.origin}/favicon.ico`;
  }

  const score = (c: IconCandidate) => {
    const rel = c.rel;
    const href = c.href.toLowerCase();

    const isSvg =
      href.endsWith(".svg") || (c.type?.toLowerCase().includes("svg") ?? false);
    const isApple = rel.includes("apple-touch-icon");
    const isShortcut = rel.includes("shortcut icon");
    const size = c.sizes ?? 0;

    // Prefer SVG or larger sizes, then apple-touch-icon, then shortcut/icon.
    return (
      (isSvg ? 10_000 : 0) +
      size * 10 +
      (isApple ? 500 : 0) +
      (isShortcut ? 50 : 0) +
      (href.includes("favicon") ? 10 : 0)
    );
  };

  candidates.sort((a, b) => score(b) - score(a));
  const best = candidates[0];
  return best.absoluteHref;
}

function decodeHtmlEntities(str: string): string {
  // Decode numeric HTML entities (&#123; or &#x7B;)
  return str
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
      String.fromCodePoint(parseInt(hex, 16))
    )
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function trimTitle(raw: string) {
  if (!raw) return "";
  // Decode HTML entities first (e.g., &#128525; → 😍)
  const decoded = decodeHtmlEntities(raw);
  const separators = [
    " | ",
    " - ",
    " — ",
    " ! ",
    "!",
    "|",
    "-",
    "—",
    "–",
    ", ",
    ",",
    ".",
    "·",
  ];
  const firstIdx = separators
    .map((sep) => decoded.indexOf(sep))
    .filter((idx) => idx >= 0)
    .sort((a, b) => a - b)[0];
  const clipped = Number.isFinite(firstIdx)
    ? decoded.slice(0, firstIdx)
    : decoded;
  return clipped.trim();
}

function trimDescription(raw: string) {
  if (!raw) return "";
  const decoded = decodeHtmlEntities(raw);
  const dotIdx = decoded.indexOf(".");
  if (dotIdx >= 0) {
    return decoded.slice(0, dotIdx + 1).trim();
  }
  return decoded.trim();
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { url } = await request.json();

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    const googleFaviconUrl = `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(
      url
    )}&sz=128`;

    // Check if it's a YouTube URL
    const youtubeRegex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);

    if (youtubeMatch) {
      const videoId = youtubeMatch[1];
      return NextResponse.json({
        title: "",
        description: "",
        og_image_url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        favicon_url: "https://www.youtube.com/favicon.ico",
        media_type: "youtube",
        media_embed_id: videoId,
      });
    }

    // Check if it's a Vimeo URL
    const vimeoRegex = /vimeo\.com\/(\d+)/;
    const vimeoMatch = url.match(vimeoRegex);

    if (vimeoMatch) {
      const videoId = vimeoMatch[1];
      // Fetch Vimeo thumbnail via their API
      const vimeoResponse = await fetch(
        `https://vimeo.com/api/v2/video/${videoId}.json`
      );
      if (vimeoResponse.ok) {
        const vimeoData = await vimeoResponse.json();
        return NextResponse.json({
          title: "",
          description: "",
          og_image_url: vimeoData[0]?.thumbnail_large || null,
          favicon_url: "https://vimeo.com/favicon.ico",
          media_type: "vimeo",
          media_embed_id: videoId,
        });
      }
    }

    // Fetch OpenGraph metadata for other URLs
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      return NextResponse.json({
        title: "",
        description: "",
        og_image_url: null,
        favicon_url: null,
        media_type: "default",
        media_embed_id: null,
      });
    }

    const html = await response.text();
    // Extract title (prefer the tab title; fall back to OG/Twitter)
    const ogTitle = extractMetaContent(html, [
      { attr: "property", value: "og:title" },
      { attr: "name", value: "twitter:title" },
    ]);

    const titleTagMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const titleFromTag = titleTagMatch?.[1]?.trim() || null;

    const rawTitle = titleFromTag || ogTitle || new URL(url).hostname;
    const title = trimTitle(rawTitle);

    // Extract description
    const ogDescription = extractMetaContent(html, [
      { attr: "property", value: "og:description" },
      { attr: "name", value: "twitter:description" },
      { attr: "name", value: "description" },
    ]);

    const rawDescription = ogDescription || "";
    const description = trimDescription(rawDescription);

    const ogImageRaw = extractMetaContent(html, [
      { attr: "property", value: "og:image" },
      { attr: "property", value: "og:image:secure_url" },
      { attr: "name", value: "twitter:image" },
      { attr: "name", value: "twitter:image:src" },
    ]);
    const ogImage = ogImageRaw ? makeAbsoluteUrl(url, ogImageRaw) : null;

    const bestIconUrl = pickBestIconUrl(url, html);
    const candidates = extractIconCandidates(html);
    const maxDeclaredSize = Math.max(0, ...candidates.map((c) => c.sizes ?? 0));

    // If the page only declares tiny icons (common on some sites), use a higher-res favicon service.
    // This avoids giant pixelated placeholders (e.g., Reddit) and improves consistency.
    const faviconUrl =
      candidates.length === 0 || (maxDeclaredSize > 0 && maxDeclaredSize < 48)
        ? googleFaviconUrl
        : bestIconUrl;

    return NextResponse.json({
      title,
      description,
      og_image_url: ogImage,
      favicon_url: faviconUrl,
      media_type: "default",
      media_embed_id: null,
    });
  } catch (error) {
    console.error("Error fetching metadata:", error);
    return NextResponse.json({
      title: "",
      description: "",
      og_image_url: null,
      favicon_url: null,
      media_type: "default",
      media_embed_id: null,
    });
  }
}
