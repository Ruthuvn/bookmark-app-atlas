import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  // Authenticate the request
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.trim().length === 0) {
    return NextResponse.json([]);
  }

  // Limit query length to prevent abuse
  if (query.length > 200) {
    return NextResponse.json({ error: "Query too long" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(
        query,
      )}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(5000),
      },
    );

    if (!response.ok) {
      console.error("Google suggestions API error:", response.status);
      return NextResponse.json([]);
    }

    const data = await response.json();
    // Google returns [query, [suggestion1, suggestion2, ...]]
    const suggestions =
      Array.isArray(data) && Array.isArray(data[1]) ? data[1] : [];

    // Limit to 8 suggestions for better UX
    return NextResponse.json(suggestions.slice(0, 8));
  } catch (error) {
    console.error("Search suggestions error:", error);
    // Return empty array instead of error to gracefully degrade
    return NextResponse.json([]);
  }
}
