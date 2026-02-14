import crypto from "crypto";

export type BookmarkMediaKind = "ogimage" | "favicon";

function normalizeUrlForKey(rawUrl: string) {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    // Be tolerant of inputs without a scheme.
    url = new URL(`https://${rawUrl}`);
  }

  // Treat http/https consistently for storage keys.
  if (url.protocol === "http:") {
    url.protocol = "https:";
  }

  url.hash = "";

  // Keep querystring (the user asked for "same url" matching).
  // Normalize hostname casing.
  url.hostname = url.hostname.toLowerCase();

  // Remove default ports.
  if (
    (url.protocol === "https:" && url.port === "443") ||
    (url.protocol === "http:" && url.port === "80")
  ) {
    url.port = "";
  }

  // Strip common tracking params.
  const trackingKeys = new Set([
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "utm_id",
    "utm_name",
    "utm_reader",
    "utm_viz_id",
    "utm_pubreferrer",
    "utm_swu",
    "gclid",
    "fbclid",
    "igshid",
    "mc_cid",
    "mc_eid",
    "ref",
  ]);

  for (const key of Array.from(url.searchParams.keys())) {
    if (trackingKeys.has(key.toLowerCase())) {
      url.searchParams.delete(key);
    }
  }

  // Sort query params for consistent ordering.
  if (url.searchParams.toString()) {
    const pairs = Array.from(url.searchParams.entries()).sort((a, b) => {
      const keyCmp = a[0].localeCompare(b[0]);
      if (keyCmp !== 0) return keyCmp;
      return a[1].localeCompare(b[1]);
    });
    url.search = "";
    for (const [k, v] of pairs) url.searchParams.append(k, v);
  }

  // Normalize a trailing slash (common source of accidental mismatches).
  if (url.pathname !== "/" && url.pathname.endsWith("/")) {
    url.pathname = url.pathname.slice(0, -1);
  }

  return url.toString();
}

export function makeBookmarkMediaKey(rawUrl: string) {
  return crypto
    .createHash("sha256")
    .update(normalizeUrlForKey(rawUrl))
    .digest("hex");
}

export function mimeToExtension(mime: string, filename?: string) {
  const normalized = mime.toLowerCase().trim();

  if (normalized === "image/jpeg") return "jpg";
  if (normalized === "image/png") return "png";
  if (normalized === "image/webp") return "webp";

  // favicons
  if (
    normalized === "image/x-icon" ||
    normalized === "image/vnd.microsoft.icon"
  ) {
    return "ico";
  }
  if (normalized === "image/svg+xml") return "svg";

  // Fallback to filename extension when provided.
  const ext = filename?.split(".").pop()?.toLowerCase();
  if (ext && /^[a-z0-9]+$/.test(ext)) return ext;

  return null;
}

export function makeBookmarkMediaPath(params: {
  userId: string;
  url: string;
  kind: BookmarkMediaKind;
  ext: string;
}) {
  const key = makeBookmarkMediaKey(params.url);
  return `${params.userId}/${params.kind}/${key}.${params.ext}`;
}
