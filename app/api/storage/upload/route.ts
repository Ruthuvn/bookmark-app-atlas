import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  mimeToExtension,
  makeBookmarkMediaPath,
  type BookmarkMediaKind,
} from "@/lib/storage/bookmark-media";

const OG_ALLOWED = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);
const FAV_ALLOWED = new Set([
  "image/png",
  "image/x-icon",
  "image/vnd.microsoft.icon",
  "image/svg+xml",
]);

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json(
      { error: "Expected multipart/form-data" },
      { status: 400 }
    );
  }

  const form = await request.formData();
  const file = form.get("file");
  const urlRaw = form.get("url");
  const kindRaw = form.get("kind");

  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }
  if (typeof urlRaw !== "string" || !urlRaw.trim()) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }
  if (kindRaw !== "ogimage" && kindRaw !== "favicon") {
    return NextResponse.json({ error: "Invalid kind" }, { status: 400 });
  }

  let url: URL;
  try {
    url = new URL(urlRaw);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const kind = kindRaw as BookmarkMediaKind;

  const filename = "name" in file ? String((file as any).name ?? "") : "";
  const extFromName = filename.split(".").pop()?.toLowerCase() ?? "";

  // Some browsers (notably for .ico) may send an empty MIME type.
  // Infer it from the filename extension in that case.
  const mime =
    (file.type || "").toLowerCase() ||
    (extFromName === "jpg" || extFromName === "jpeg"
      ? "image/jpeg"
      : extFromName === "png"
      ? "image/png"
      : extFromName === "webp"
      ? "image/webp"
      : extFromName === "ico"
      ? "image/x-icon"
      : extFromName === "svg"
      ? "image/svg+xml"
      : "");

  const allowed = kind === "ogimage" ? OG_ALLOWED : FAV_ALLOWED;
  if (!allowed.has(mime)) {
    return NextResponse.json(
      {
        error:
          kind === "ogimage"
            ? "Unsupported image type. Use JPEG, PNG, or WebP."
            : "Unsupported image type. Use PNG, ICO, or SVG.",
      },
      { status: 400 }
    );
  }

  // Size limits (mirror your bucket settings; server-side enforcement).
  const maxBytes = kind === "ogimage" ? 1_000_000 : 100_000;
  if (file.size > maxBytes) {
    return NextResponse.json(
      { error: `File too large (max ${maxBytes} bytes)` },
      { status: 400 }
    );
  }

  const ext = mimeToExtension(mime, filename);
  if (!ext) {
    return NextResponse.json(
      { error: "Could not determine extension" },
      { status: 400 }
    );
  }

  const path = makeBookmarkMediaPath({
    userId: user.id,
    url: url.toString(),
    kind,
    ext,
  });

  const bucket = kind;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, bytes, {
      contentType: mime,
      upsert: true,
      cacheControl: "3600",
    });

  if (uploadError) {
    console.error("Upload error:", {
      message: uploadError.message,
      path,
      bucket,
      userId: user.id,
    });
    return NextResponse.json(
      {
        error: uploadError.message,
        details: { path, bucket },
      },
      { status: 500 }
    );
  }

  if (!uploadData) {
    console.error("Upload succeeded but no data returned", { path, bucket });
    return NextResponse.json(
      { error: "Upload succeeded but no data returned" },
      { status: 500 }
    );
  }

  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  const publicUrl = publicUrlData.publicUrl;

  console.log("Upload successful:", { path, publicUrl });

  return NextResponse.json({ path, publicUrl });
}
