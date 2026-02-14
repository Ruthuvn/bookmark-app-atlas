import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseNetscapeBookmarksFlat } from "@/lib/bookmarks/netscape";

const CATEGORY_DEFAULT_ICON = "folder";

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

type ImportOptions = {
  categories?: string[];
  skipExisting?: boolean;
};

async function readImportPayload(
  request: Request
): Promise<{ html: string; options: ImportOptions }> {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const file = form.get("file");
    const categoriesRaw = form.get("categories");
    const skipExistingRaw = form.get("skipExisting");

    if (!file || !(file instanceof Blob)) {
      throw new Error("Missing file field");
    }

    const options: ImportOptions = {};
    if (typeof categoriesRaw === "string" && categoriesRaw.trim()) {
      const parsed = JSON.parse(categoriesRaw);
      if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) {
        options.categories = parsed;
      }
    }

    if (typeof skipExistingRaw === "string") {
      options.skipExisting = skipExistingRaw === "true";
    }

    return { html: await file.text(), options };
  }

  if (contentType.includes("text/")) {
    const text = await request.text();
    if (!text.trim()) {
      throw new Error("Empty body");
    }
    return { html: text, options: {} };
  }

  // Default to JSON payload: { html: "...", categories?: string[], skipExisting?: boolean }
  const body = (await request.json()) as {
    html?: unknown;
    categories?: unknown;
    skipExisting?: unknown;
  };
  if (typeof body?.html !== "string" || !body.html.trim()) {
    throw new Error("Missing html");
  }

  const options: ImportOptions = {};
  if (
    Array.isArray(body.categories) &&
    body.categories.every((x) => typeof x === "string")
  ) {
    options.categories = body.categories as string[];
  }
  if (typeof body.skipExisting === "boolean") {
    options.skipExisting = body.skipExisting;
  }

  return { html: body.html, options };
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

  let html: string;
  let options: ImportOptions = {};
  try {
    const payload = await readImportPayload(request);
    html = payload.html;
    options = payload.options;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid request" },
      { status: 400 }
    );
  }

  let parsed = parseNetscapeBookmarksFlat(html);

  if (options.categories && options.categories.length > 0) {
    const allowed = new Set(options.categories);
    parsed = parsed.filter((b) => allowed.has(b.categoryName));
  }

  if (parsed.length === 0) {
    return NextResponse.json(
      { imported: 0, categoriesCreated: 0 },
      { status: 200 }
    );
  }

  // Fetch existing categories for user.
  const { data: existingCategories, error: categoriesError } = await supabase
    .from("categories")
    .select("id,name")
    .eq("user_id", user.id);

  if (categoriesError) {
    return NextResponse.json(
      { error: categoriesError.message },
      { status: 500 }
    );
  }

  const categoryIdByName = new Map<string, string>();
  for (const category of existingCategories ?? []) {
    categoryIdByName.set(category.name, category.id);
  }

  // Create any missing categories (top-level folders, plus "Bookmarks" if needed).
  const neededCategoryNames = Array.from(
    new Set(parsed.map((b) => b.categoryName).filter(Boolean))
  );

  const missingCategoryNames = neededCategoryNames.filter(
    (name) => !categoryIdByName.has(name)
  );

  let categoriesCreated = 0;
  if (missingCategoryNames.length > 0) {
    const { data: insertedCategories, error: insertCategoryError } =
      await supabase
        .from("categories")
        .upsert(
          missingCategoryNames.map((name) => ({
            user_id: user.id,
            name,
            icon: CATEGORY_DEFAULT_ICON,
            color: null,
            order: 0,
          })),
          { onConflict: "user_id,name" }
        )
        .select("id,name");

    if (insertCategoryError) {
      return NextResponse.json(
        { error: insertCategoryError.message },
        { status: 500 }
      );
    }

    categoriesCreated = insertedCategories?.length ?? 0;
    for (const category of insertedCategories ?? []) {
      categoryIdByName.set(category.name, category.id);
    }
  }

  // Insert bookmarks in chunks.
  let rows = parsed
    .map((b) => {
      const categoryId = categoryIdByName.get(b.categoryName) ?? null;
      return {
        user_id: user.id,
        category_id: categoryId,
        title: b.title,
        url: b.url,
        description: null,
        og_image_url: null,
        favicon_url: null,
        media_type: null,
        media_embed_id: null,
      };
    })
    // Basic validation
    .filter((r) => r.url && r.title);

  let skippedExisting = 0;
  if (options.skipExisting) {
    const uniqueUrls = Array.from(new Set(rows.map((r) => r.url)));
    const existingUrls = new Set<string>();

    for (const batch of chunk(uniqueUrls, 200)) {
      const { data, error } = await supabase
        .from("bookmarks")
        .select("url")
        .eq("user_id", user.id)
        .in("url", batch);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      for (const row of data ?? []) {
        if (row.url) existingUrls.add(row.url);
      }
    }

    const before = rows.length;
    rows = rows.filter((r) => !existingUrls.has(r.url));
    skippedExisting = before - rows.length;
  }

  let imported = 0;
  const insertedBookmarks: Array<{ id: string; url: string }> = [];
  const chunks = chunk(rows, 200);

  if (chunks.length === 0) {
    return NextResponse.json(
      {
        imported: 0,
        skippedExisting,
        categoriesCreated,
        categoriesTouched: neededCategoryNames.length,
        insertedBookmarks: [],
      },
      { status: 200 }
    );
  }

  for (const batch of chunks) {
    const { data, error } = await supabase
      .from("bookmarks")
      .insert(batch)
      .select("id,url");
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    for (const row of data ?? []) {
      if (row?.id && row?.url)
        insertedBookmarks.push({ id: row.id, url: row.url });
    }
    imported += batch.length;
  }

  return NextResponse.json(
    {
      imported,
      skippedExisting,
      categoriesCreated,
      categoriesTouched: neededCategoryNames.length,
      insertedBookmarks,
    },
    { status: 201 }
  );
}
