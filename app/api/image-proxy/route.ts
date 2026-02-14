import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import sharp from "sharp";

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
  const imageUrl = searchParams.get("url");
  const width = searchParams.get("w"); // e.g., ?w=300
  const format = searchParams.get("fmt"); // e.g., &fmt=webp
  const quality = searchParams.get("q") || "75"; // default quality

  if (!imageUrl) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    // Validate URL
    const url = new URL(imageUrl);

    // Only allow http and https protocols
    if (!["http:", "https:"].includes(url.protocol)) {
      return NextResponse.json({ error: "Invalid protocol" }, { status: 400 });
    }

    // Fetch the image
    const response = await fetch(imageUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept: "image/*",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch image" },
        { status: response.status },
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    let buffer: Buffer | ArrayBuffer = arrayBuffer;
    let contentType = response.headers.get("content-type") || "image/jpeg";

    // Resize and convert format if requested
    if (width || format) {
      try {
        // Use Buffer.from for better Sharp compatibility
        let pipeline = sharp(Buffer.from(arrayBuffer));

        // Resize if width is specified
        if (width) {
          const widthNum = Math.min(parseInt(width), 2000); // Max 2000px
          pipeline = pipeline.resize(widthNum, null, {
            withoutEnlargement: true,
          });
        }

        // Convert format if specified, otherwise use original
        const targetFormat =
          format || (contentType.includes("webp") ? "webp" : "jpeg");
        const qualityNum = Math.min(Math.max(parseInt(quality), 50), 95);

        if (targetFormat === "webp") {
          pipeline = pipeline.webp({ quality: qualityNum });
          contentType = "image/webp";
        } else if (targetFormat === "jpeg" || targetFormat === "jpg") {
          pipeline = pipeline.jpeg({ quality: qualityNum, progressive: true });
          contentType = "image/jpeg";
        } else if (targetFormat === "png") {
          pipeline = pipeline.png({ compressionLevel: 9 });
          contentType = "image/png";
        }

        const processedBuffer = await pipeline.toBuffer();
        // Return the Buffer directly, don't use .buffer as it can be unsafe
        buffer = processedBuffer;
      } catch (sharpError) {
        console.error("Sharp processing error for URL:", imageUrl);
        console.error("Content-Type:", contentType);
        console.error("Buffer length:", arrayBuffer.byteLength);
        if (arrayBuffer.byteLength > 0) {
          console.error(
            "Buffer start (hex):",
            Buffer.from(arrayBuffer.slice(0, 16)).toString("hex"),
          );
        }
        console.error(sharpError);
        // Fall back to original buffer if processing fails
      }
    }

    // Return the image with appropriate headers
    return new NextResponse(buffer as BodyInit, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000", // Cache for 365 days
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Image proxy error:", error);
    return NextResponse.json(
      { error: "Failed to proxy image" },
      { status: 500 },
    );
  }
}
