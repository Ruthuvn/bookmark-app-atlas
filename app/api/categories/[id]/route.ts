import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
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
  const { name, icon, color, order } = body;

  const { data, error } = await supabase
    .from("categories")
    .update({ name, icon, color, order })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
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

  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (categoryError) {
    return NextResponse.json({ error: categoryError.message }, { status: 500 });
  }

  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  const { error: bookmarksError } = await supabase
    .from("bookmarks")
    .delete()
    .eq("user_id", user.id)
    .eq("category_id", id);

  if (bookmarksError) {
    return NextResponse.json(
      { error: bookmarksError.message },
      { status: 500 }
    );
  }

  const { error: deleteCategoryError } = await supabase
    .from("categories")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (deleteCategoryError) {
    return NextResponse.json(
      { error: deleteCategoryError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
