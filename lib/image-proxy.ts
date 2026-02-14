/**
 * Converts an external image URL to use our image proxy.
 * This bypasses CORS restrictions by fetching images server-side.
 *
 * @param url The original image URL
 * @returns The proxied URL, or the original if it's already a local/data URL
 */
export function getProxiedImageUrl(
  url: string | null | undefined
): string | null {
  if (!url) return null;

  // Don't proxy data URLs, local URLs, or already-proxied URLs
  if (
    url.startsWith("data:") ||
    url.startsWith("/") ||
    url.startsWith(window.location.origin) ||
    url.includes("/api/image-proxy")
  ) {
    return url;
  }

  // Proxy external URLs
  return `/api/image-proxy?url=${encodeURIComponent(url)}`;
}

/**
 * Generates an optimized image URL with width and format parameters.
 * Resizes and converts images to WebP for better performance.
 *
 * @param url Original image URL
 * @param width Optional width in pixels (will be resized)
 * @param format Optional format: 'webp', 'jpeg', 'png' (default: webp)
 * @param quality Optional quality 50-95 (default: 75)
 * @returns Proxied URL with optimization parameters
 */
export function getOptimizedImageUrl(
  url: string | null | undefined,
  width?: number,
  format?: "webp" | "jpeg" | "png",
  quality?: number
): string | null {
  if (!url) return null;

  // Don't proxy data URLs or local URLs
  if (
    url.startsWith("data:") ||
    url.startsWith("/") ||
    url.startsWith(window.location.origin)
  ) {
    return url;
  }

  // Build proxy URL with parameters
  let proxyUrl = `/api/image-proxy?url=${encodeURIComponent(url)}`;

  if (width) {
    proxyUrl += `&w=${width}`;
  }

  if (format) {
    proxyUrl += `&fmt=${format}`;
  }

  if (quality) {
    proxyUrl += `&q=${quality}`;
  }

  return proxyUrl;
}
