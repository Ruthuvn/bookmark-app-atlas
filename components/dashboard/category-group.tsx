"use client";

import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";

import { cn } from "@/lib/utils";
import { getCategoryIcon } from "@/components/dashboard/icon-picker";
import { useCollapsedCategories } from "@/hooks/use-preferences";
import type { Category } from "@/lib/supabase/types";

interface CategoryGroupProps {
  category:
    | Category
    | { id: string; name: string; icon?: string; color?: string };
  bookmarkCount: number;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

export function CategoryGroup({
  category,
  bookmarkCount,
  children,
}: CategoryGroupProps) {
  const { isCollapsed, toggleCategory } = useCollapsedCategories();
  const collapsed = isCollapsed(category.id);
  const isExpanded = !collapsed;

  const toggleExpanded = () => {
    toggleCategory(category.id);
  };

  const icon = getCategoryIcon(category.icon || "folder");
  const color = category.color || undefined;

  return (
    <div className="border border-border bg-card overflow-hidden break-inside-avoid mb-4">
      {/* Category Header */}
      <button
        onClick={toggleExpanded}
        className="flex w-full items-center gap-3 px-4 py-3 border-b border-border bg-muted/30 hover:bg-muted/50 transition-colors text-left group"
      >
        {/* Expand/Collapse Icon */}
        <motion.div
          animate={{ rotate: isExpanded ? 0 : -90 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="shrink-0"
        >
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors"
          />
        </motion.div>

        {/* Category Icon */}
        <HugeiconsIcon
          icon={icon}
          className="h-5 w-5 shrink-0"
          style={color ? { color } : undefined}
        />

        {/* Category Name */}
        <span className="font-medium text-sm flex-1 truncate">
          {category.name}
        </span>

        {/* Bookmark Count */}
        <span className="text-xs text-muted-foreground tabular-nums">
          {bookmarkCount} {bookmarkCount === 1 ? "bookmark" : "bookmarks"}
        </span>
      </button>

      {/* Bookmarks Content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
              opacity: { duration: 0.2, ease: "easeOut" },
            }}
          >
            <div className="p-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
