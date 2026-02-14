import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const DEFAULT_PREFERENCES = {
  sidebar_expanded: true,
  theme: "system",
  // Desktop
  view_mode_desktop: "card" as const,
  card_columns_desktop: 4,
  list_columns_desktop: 1,
  group_columns_desktop: 1,
  // Mobile
  view_mode_mobile: "card" as const,
  card_columns_mobile: 1,
  list_columns_mobile: 1,
  group_columns_mobile: 1,
  collapsed_categories: [] as string[],
  sort_by: "created_at",
  sort_order: "desc",
};

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error && error.code === "PGRST116") {
    // No preferences found, return defaults
    return NextResponse.json({
      user_id: user.id,
      ...DEFAULT_PREFERENCES,
    });
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
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
    view_mode_desktop,
    card_columns_desktop,
    list_columns_desktop,
    group_columns_desktop,
    view_mode_mobile,
    card_columns_mobile,
    list_columns_mobile,
    group_columns_mobile,
    theme,
    sidebar_expanded,
    collapsed_categories,
    sort_by,
    sort_order,
  } = body;

  // Upsert preferences (insert if not exists, update if exists)
  const { data, error } = await supabase
    .from("user_preferences")
    .upsert(
      {
        user_id: user.id,
        ...(view_mode_desktop !== undefined && { view_mode_desktop }),
        ...(card_columns_desktop !== undefined && { card_columns_desktop }),
        ...(list_columns_desktop !== undefined && { list_columns_desktop }),
        ...(group_columns_desktop !== undefined && { group_columns_desktop }),
        ...(view_mode_mobile !== undefined && { view_mode_mobile }),
        ...(card_columns_mobile !== undefined && { card_columns_mobile }),
        ...(list_columns_mobile !== undefined && { list_columns_mobile }),
        ...(group_columns_mobile !== undefined && { group_columns_mobile }),
        ...(theme !== undefined && { theme }),
        ...(sidebar_expanded !== undefined && { sidebar_expanded }),
        ...(collapsed_categories !== undefined && { collapsed_categories }),
        ...(sort_by !== undefined && { sort_by }),
        ...(sort_order !== undefined && { sort_order }),
      },
      { onConflict: "user_id" },
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
