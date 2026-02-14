import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { makeBookmarkMediaKey } from "@/lib/storage/bookmark-media";

async function objectExists(params: {
  supabase: Awaited<ReturnType<typeof createClient>>;
  bucket: string;
  path: string;
}) {
  const lastSlash = params.path.lastIndexOf("/");
  const dir = lastSlash >= 0 ? params.path.slice(0, lastSlash) : "";
  const name = lastSlash >= 0 ? params.path.slice(lastSlash + 1) : params.path;

  const { data, error } = await params.supabase.storage
    .from(params.bucket)
    .list(dir, {
      search: name,
      limit: 10,
    });

  if (error) {
    // Treat listing issues as "not found" to avoid blocking the UX.
    return false;
  }

  return (data ?? []).some((x) => x.name === name);
}

function getPublicUrl(params: {
  supabase: Awaited<ReturnType<typeof createClient>>;
  bucket: string;
  path: string;
}) {
  return params.supabase.storage.from(params.bucket).getPublicUrl(params.path)
    .data.publicUrl;
}

export async function GET(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  // Deterministic paths so if the user re-adds the same URL later we can detect it.
  const key = makeBookmarkMediaKey(parsed.toString());
  const ogPathPng = `${user.id}/ogimage/${key}.png`;
  const ogPathJpg = `${user.id}/ogimage/${key}.jpg`;
  const ogPathWebp = `${user.id}/ogimage/${key}.webp`;

  const favPathPng = `${user.id}/favicon/${key}.png`;
  const favPathIco = `${user.id}/favicon/${key}.ico`;
  const favPathSvg = `${user.id}/favicon/${key}.svg`;

  const [hasOgPng, hasOgJpg, hasOgWebp, hasFavPng, hasFavIco, hasFavSvg] =
    await Promise.all([
      objectExists({ supabase, bucket: "ogimage", path: ogPathPng }),
      objectExists({ supabase, bucket: "ogimage", path: ogPathJpg }),
      objectExists({ supabase, bucket: "ogimage", path: ogPathWebp }),
      objectExists({ supabase, bucket: "favicon", path: favPathPng }),
      objectExists({ supabase, bucket: "favicon", path: favPathIco }),
      objectExists({ supabase, bucket: "favicon", path: favPathSvg }),
    ]);

  const ogimagePath = hasOgWebp
    ? ogPathWebp
    : hasOgPng
    ? ogPathPng
    : hasOgJpg
    ? ogPathJpg
    : null;

  const faviconPath = hasFavSvg
    ? favPathSvg
    : hasFavPng
    ? favPathPng
    : hasFavIco
    ? favPathIco
    : null;

  return NextResponse.json({
    ogimage: ogimagePath
      ? {
          path: ogimagePath,
          publicUrl: getPublicUrl({
            supabase,
            bucket: "ogimage",
            path: ogimagePath,
          }),
        }
      : null,
    favicon: faviconPath
      ? {
          path: faviconPath,
          publicUrl: getPublicUrl({
            supabase,
            bucket: "favicon",
            path: faviconPath,
          }),
        }
      : null,
  });
}
