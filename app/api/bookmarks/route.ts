import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Generate optimized thumbnail URLs for faster loading
 * Thumbnails are pre-generated and stored in DB to avoid runtime computation
 */
function generateThumbnailUrl(
  imageUrl: string | null | undefined,
  width: number,
  quality: number,
): string | null {
  if (!imageUrl) return null;

  // Build the thumbnail URL using our image proxy
  return `/api/image-proxy?url=${encodeURIComponent(
    imageUrl,
  )}&w=${width}&fmt=webp&q=${quality}`;
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
  const categoryId = searchParams.get("category");

  const rawSortBy = searchParams.get("sort_by") || "created_at";
  const rawSortOrder = searchParams.get("sort_order") || "desc";

  const sortBy = ["created_at", "updated_at", "title"].includes(rawSortBy)
    ? (rawSortBy as "created_at" | "updated_at" | "title")
    : "created_at";

  const sortOrder = ["asc", "desc"].includes(rawSortOrder)
    ? (rawSortOrder as "asc" | "desc")
    : "desc";

  let query = supabase
    .from("bookmarks")
    .select(
      `
      *,
      category:categories(*)
    `,
    )
    .eq("user_id", user.id)
    .order(sortBy, { ascending: sortOrder === "asc" });

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

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
      og_image_url,
      favicon_url,
      media_type,
      media_embed_id,
    } = body;

    // Validate required fields
    if (!title?.trim() || !url?.trim()) {
      return NextResponse.json(
        { error: "Title and URL are required" },
        { status: 400 }
      );
    }

    // Pre-generate thumbnail URLs to avoid runtime computation
    const og_image_url_thumb = generateThumbnailUrl(og_image_url, 300, 75);
    const favicon_url_thumb = generateThumbnailUrl(favicon_url, 32, 75);

    // Build insert object with only defined values
    const insertData: Record<string, any> = {
      user_id: user.id,
      title: title.trim(),
      url: url.trim(),
    };

    // Only add optional fields if they have values
    if (description?.trim()) insertData.description = description.trim();
    if (og_image_url) {
      insertData.og_image_url = og_image_url;
      insertData.og_image_url_thumb = og_image_url_thumb;
    }
    if (favicon_url) {
      insertData.favicon_url = favicon_url;
      insertData.favicon_url_thumb = favicon_url_thumb;
    }
    if (media_type && media_type !== "default") {
      insertData.media_type = media_type;
    }
    if (media_embed_id?.trim()) {
      insertData.media_embed_id = media_embed_id.trim();
    }

    const { data, error } = await supabase
      .from("bookmarks")
      .insert(insertData)
      .select("*")
      .single();

    if (error) {
      console.error("Bookmark creation error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to create bookmark" },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
