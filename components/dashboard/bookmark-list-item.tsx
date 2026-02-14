"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Link01Icon,
  Edit02Icon,
  Delete02Icon,
  Copy01Icon,
} from "@hugeicons/core-free-icons";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getOptimizedImageUrl } from "@/lib/image-proxy";
import { cn } from "@/lib/utils";
import type { DensityLevel } from "@/lib/density";
import type { BookmarkWithCategory } from "@/lib/supabase/types";

interface BookmarkListItemProps {
  bookmark: BookmarkWithCategory;
  density: DensityLevel;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onCopy: (url: string) => void;
}

export function BookmarkListItem({
  bookmark,
  density,
  onEdit,
  onDelete,
  onCopy,
}: BookmarkListItemProps) {
  const [faviconError, setFaviconError] = useState(false);

  const handleOpen = () => {
    window.open(bookmark.url, "_blank", "noopener,noreferrer");
  };

  const handleCopy = () => {
    onCopy(bookmark.url);
  };

  // Use pre-generated thumbnails from database if available
  const faviconUrl =
    (bookmark as never as { favicon_url_thumb?: string }).favicon_url_thumb ||
    getOptimizedImageUrl(bookmark.favicon_url, 32, "webp");

  // Determine layout based on density
  const isVertical = density === "compact" || density === "icon";
  const showTitle = density !== "icon";
  const showDescription = density === "normal";

  // Only show tooltip at icon density (when title is completely hidden)
  const needsTooltip = density === "icon";

  // Should show fallback icon
  const showFaviconFallback =
    !bookmark.favicon_url || (bookmark.favicon_url && faviconError);

  // Favicon size based on density
  const faviconSize =
    density === "icon"
      ? "size-10"
      : density === "compact"
        ? "size-8"
        : "size-6";
  const faviconContainerSize =
    density === "icon"
      ? "size-14"
      : density === "compact"
        ? "size-12"
        : "size-10";

  // Padding based on density
  const padding =
    density === "normal"
      ? "p-3"
      : density === "comfortable"
        ? "p-2.5"
        : density === "compact"
          ? "p-2"
          : "p-1.5";

  // Minimum height for adequate hit targets (44px mobile, 24px desktop)
  const minHeight = density === "icon" ? "min-h-[56px]" : "";

  const listItemElement = (
    <div
      className={cn(
        "group cursor-pointer transition-colors",
        "hover:bg-muted/50 hover:ring-1 hover:ring-primary/50",
        "border-b last:border-b-0",
        padding,
        minHeight,
        isVertical
          ? "flex flex-col items-center justify-center text-center"
          : "flex items-center gap-3",
      )}
      onClick={handleOpen}
    >
      {/* Favicon */}
      <div
        className={cn(
          "shrink-0 flex items-center justify-center",
          faviconContainerSize,
        )}
      >
        {!showFaviconFallback ? (
          <img
            src={faviconUrl || undefined}
            alt=""
            className={cn(
              "object-contain dark:drop-shadow-[0_0_1px_rgba(255,255,255,0.5)]",
              faviconSize,
            )}
            loading="lazy"
            onError={() => setFaviconError(true)}
          />
        ) : (
          <HugeiconsIcon
            icon={Link01Icon}
            className={cn("text-muted-foreground", faviconSize)}
          />
        )}
      </div>

      {/* Content */}
      {showTitle && (
        <div
          className={cn(
            "min-w-0",
            isVertical ? "w-full mt-1" : "flex-1 flex flex-col gap-0.5",
          )}
        >
          <span
            className={cn(
              "line-clamp-1 font-medium",
              density === "compact" ? "text-xs" : "text-sm",
            )}
          >
            {bookmark.title}
          </span>
          {showDescription && bookmark.description && (
            <span className="line-clamp-1 text-xs text-muted-foreground">
              {bookmark.description}
            </span>
          )}
        </div>
      )}
    </div>
  );

  // Wrap with tooltip only when title is completely hidden (icon density)
  const listItemWithTooltip = needsTooltip ? (
    <Tooltip>
      <TooltipTrigger
        render={(props) => <div {...props}>{listItemElement}</div>}
      />
      <TooltipContent side="bottom" className="max-w-xs">
        <p className="font-medium">{bookmark.title}</p>
        {bookmark.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {bookmark.description}
          </p>
        )}
      </TooltipContent>
    </Tooltip>
  ) : (
    listItemElement
  );

  return (
    <ContextMenu>
      <ContextMenuTrigger
        render={(props) => <div {...props}>{listItemWithTooltip}</div>}
      />

      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={handleOpen}>
          <HugeiconsIcon icon={Link01Icon} className="mr-2 size-4" />
          Open Link
        </ContextMenuItem>
        <ContextMenuItem onClick={handleCopy}>
          <HugeiconsIcon icon={Copy01Icon} className="mr-2 size-4" />
          Copy Link
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => onEdit(bookmark.id)}>
          <HugeiconsIcon icon={Edit02Icon} className="mr-2 size-4" />
          Edit Bookmark
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() => onDelete(bookmark.id)}
          variant="destructive"
        >
          <HugeiconsIcon icon={Delete02Icon} className="mr-2 size-4" />
          Delete Bookmark
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
