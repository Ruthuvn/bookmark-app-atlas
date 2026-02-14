import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { makeBookmarkMediaKey } from "@/lib/storage/bookmark-media";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const { id } = await params;

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    title,
    url,
    description,
    category_id,
    og_image_url,
    favicon_url,
    media_type,
    media_embed_id,
  } = body;

  const updates: Record<string, unknown> = {};
  if (title !== undefined) updates.title = title;
  if (url !== undefined) updates.url = url;
  if (description !== undefined) updates.description = description;
  if (category_id !== undefined) updates.category_id = category_id;
  if (og_image_url !== undefined) updates.og_image_url = og_image_url;
  if (favicon_url !== undefined) updates.favicon_url = favicon_url;
  if (media_type !== undefined) updates.media_type = media_type;
  if (media_embed_id !== undefined) updates.media_embed_id = media_embed_id;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("bookmarks")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select(
      `
      *,
      category:categories(*)
    `,
    )
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Bookmark not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const { id } = await params;

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch the bookmark URL first so we can remove any stored media objects.
  const { data: bookmark, error: bookmarkError } = await supabase
    .from("bookmarks")
    .select("url")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (bookmarkError) {
    return NextResponse.json({ error: bookmarkError.message }, { status: 500 });
  }

  if (!bookmark) {
    return NextResponse.json({ error: "Bookmark not found" }, { status: 404 });
  }

  // Best-effort: delete stored media for this URL so re-adding later is clean.
  // Run cleanup in parallel (non-blocking) for faster response
  const cleanupPromise = (async () => {
    try {
      const key = makeBookmarkMediaKey(bookmark.url);
      const ogPaths = [
        `${user.id}/ogimage/${key}.png`,
        `${user.id}/ogimage/${key}.jpg`,
        `${user.id}/ogimage/${key}.webp`,
      ];
      const favPaths = [
        `${user.id}/favicon/${key}.png`,
        `${user.id}/favicon/${key}.ico`,
        `${user.id}/favicon/${key}.svg`,
      ];

      // Run both storage cleanups in parallel
      await Promise.all([
        supabase.storage.from("ogimage").remove(ogPaths),
        supabase.storage.from("favicon").remove(favPaths),
      ]);
    } catch {
      // Ignore storage cleanup failures.
    }
  })();

  // Delete bookmark and cleanup storage in parallel
  const [deleteResult] = await Promise.all([
    supabase.from("bookmarks").delete().eq("id", id).eq("user_id", user.id),
    cleanupPromise,
  ]);

  if (deleteResult.error) {
    return NextResponse.json(
      { error: deleteResult.error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
