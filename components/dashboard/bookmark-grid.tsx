"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

import { BookmarkCard } from "@/components/dashboard/bookmark-card";
import { BookmarkListItem } from "@/components/dashboard/bookmark-list-item";
import { cn } from "@/lib/utils";
import { DENSITY_GAP, type DensityLevel } from "@/lib/density";
import type { BookmarkWithCategory } from "@/lib/supabase/types";

// Grid class mapping for cards (desktop)
const CARD_GRID_CLASSES: Record<number, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  5: "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5",
  6: "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6",
  7: "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7",
  8: "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-8",
};

// Grid class mapping for lists (desktop)
const LIST_GRID_CLASSES: Record<number, string> = {
  1: "",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-2 xl:grid-cols-3",
  4: "lg:grid-cols-2 xl:grid-cols-4",
  5: "lg:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5",
};

// Mobile grid classes
const MOBILE_GRID_CLASSES: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
};

interface BookmarkGridProps {
  bookmarks: BookmarkWithCategory[];
  viewMode: "card" | "list";
  columns: number;
  density: DensityLevel;
  isMobile: boolean;
  isSelecting?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onCopy: (url: string) => void;
}

export function BookmarkGrid({
  bookmarks,
  viewMode,
  columns,
  density,
  isMobile,
  isSelecting = false,
  selectedIds = new Set(),
  onToggleSelect,
  onEdit,
  onDelete,
  onCopy,
}: BookmarkGridProps) {
  const prefersReducedMotion = useReducedMotion();

  const getGridClasses = () => {
    if (isMobile) {
      return MOBILE_GRID_CLASSES[columns] || "grid-cols-1";
    }
    const desktopClasses =
      viewMode === "card"
        ? CARD_GRID_CLASSES[columns] || CARD_GRID_CLASSES[4]
        : LIST_GRID_CLASSES[columns] || LIST_GRID_CLASSES[1];
    return `grid-cols-1 ${desktopClasses}`;
  };

  if (bookmarks.length === 0) {
    return null;
  }

  // Animation variants respecting reduced motion preference
  const itemVariants = prefersReducedMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        initial: { opacity: 0, scale: 0.96 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.96 },
      };

  const transition = prefersReducedMotion
    ? { duration: 0.15 }
    : {
        layout: {
          type: "spring",
          stiffness: 200,
          damping: 25,
          mass: 0.6,
        },
        opacity: { duration: 0.2, ease: "easeOut" },
        scale: { duration: 0.2, ease: "easeOut" },
      };

  return (
    <motion.div
      layout={!prefersReducedMotion}
      className={cn(
        "grid",
        DENSITY_GAP[density],
        getGridClasses(),
        viewMode === "card" && "auto-rows-fr",
      )}
    >
      <AnimatePresence mode="popLayout">
        {bookmarks.map((bookmark, index) => (
          <motion.div
            layout={!prefersReducedMotion}
            key={bookmark.id}
            initial={itemVariants.initial}
            animate={itemVariants.animate}
            exit={itemVariants.exit}
            transition={transition}
            className={cn(
              "relative",
              viewMode === "list" && "overflow-hidden border",
            )}
            style={
              index > 10
                ? { contentVisibility: "auto" as "auto" | "hidden" | "visible" }
                : undefined
            }
          >
            {/* Selection overlay */}
            {isSelecting && onToggleSelect && (
              <div
                className={cn(
                  "absolute inset-0 z-10 cursor-pointer transition-colors",
                  selectedIds.has(bookmark.id)
                    ? "bg-primary/10 ring-2 ring-inset ring-primary"
                    : "hover:bg-muted/50",
                )}
                onClick={() => onToggleSelect(bookmark.id)}
              />
            )}

            {viewMode === "card" ? (
              <BookmarkCard
                bookmark={bookmark}
                density={density}
                onEdit={onEdit}
                onDelete={onDelete}
                onCopy={onCopy}
              />
            ) : (
              <BookmarkListItem
                bookmark={bookmark}
                density={density}
                onEdit={onEdit}
                onDelete={onDelete}
                onCopy={onCopy}
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
