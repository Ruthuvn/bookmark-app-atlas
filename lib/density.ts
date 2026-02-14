export type DensityLevel = "normal" | "comfortable" | "compact" | "icon";

/**
 * Calculates the appropriate density level based on column settings.
 *
 * The density factor is calculated as bookmarkColumns × groupColumns.
 * Higher density means less space per bookmark, requiring more compact layouts.
 *
 * @param bookmarkColumns - Number of bookmark columns (1-8)
 * @param groupColumns - Number of group columns (1-3)
 * @param isMobile - Whether the user is on mobile
 * @returns The appropriate density level for the current settings
 */
export function calculateDensity(
  bookmarkColumns: number,
  groupColumns: number,
  isMobile: boolean,
): DensityLevel {
  if (isMobile) {
    return bookmarkColumns === 1 ? "normal" : "compact";
  }

  // Effective density factor = bookmarkColumns × groupColumns
  const density = bookmarkColumns * groupColumns;

  if (density <= 4) return "normal"; // 2×1, 2×2, 3×1, 4×1
  if (density <= 8) return "comfortable"; // 4×2, 5×1, 6×1, 3×2, 3×3
  if (density <= 15) return "compact"; // 4×3, 5×2, 5×3, 6×2, 7×1, 8×1
  return "icon"; // 6×3, 7×2, 7×3, 8×2, 8×3
}

/**
 * Gap sizes for each density level (Tailwind classes)
 */
export const DENSITY_GAP: Record<DensityLevel, string> = {
  normal: "gap-4",
  comfortable: "gap-3",
  compact: "gap-2",
  icon: "gap-1.5",
};
