"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Link01Icon,
  Edit02Icon,
  Delete02Icon,
  Copy01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

import { Card } from "@/components/ui/card";
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
import { YouTubePreview } from "@/components/dashboard/youtube-preview";
import { getOptimizedImageUrl } from "@/lib/image-proxy";
import type { DensityLevel } from "@/lib/density";
import type { BookmarkWithCategory } from "@/lib/supabase/types";

interface BookmarkCardProps {
  bookmark: BookmarkWithCategory;
  density: DensityLevel;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onCopy: (url: string) => void;
}

export function BookmarkCard({
  bookmark,
  density,
  onEdit,
  onDelete,
  onCopy,
}: BookmarkCardProps) {
  const [faviconError, setFaviconError] = useState(false);
  const [ogImageError, setOgImageError] = useState(false);

  const handleOpen = () => {
    window.open(bookmark.url, "_blank", "noopener,noreferrer");
  };

  const handleCopy = () => {
    onCopy(bookmark.url);
  };

  const isYouTube =
    bookmark.media_type === "youtube" && bookmark.media_embed_id;

  // Use pre-generated thumbnails from database if available, or optimize on the fly
  const ogImageUrl =
    (bookmark as never as { og_image_url_thumb?: string }).og_image_url_thumb ||
    getOptimizedImageUrl(bookmark.og_image_url, 300, "webp", 75);

  const faviconUrl =
    (bookmark as never as { favicon_url_thumb?: string }).favicon_url_thumb ||
    getOptimizedImageUrl(bookmark.favicon_url, 32, "webp");

  // Determine what to show based on density
  const showTitle = density === "normal" || density === "comfortable";
  const showDescription = density === "normal";
  const showOnlyFavicon = density === "icon";

  // Only show tooltip when title is NOT visible (compact/icon densities)
  const needsTooltip = !showTitle;

  // Aspect ratio based on density
  const aspectClass =
    density === "compact"
      ? "aspect-[4/3]"
      : showOnlyFavicon
        ? "aspect-square"
        : "aspect-video";

  // Padding based on density
  const contentPadding = density === "normal" ? "p-3" : "p-2";

  // Check if we should show fallback
  const hasFavicon = bookmark.favicon_url && !faviconError;
  const hasOgImage = bookmark.og_image_url && !ogImageError;

  // OG Image placeholder - clean, minimal design
  const OgImagePlaceholder = () => (
    <div className="flex size-full items-center justify-center bg-muted">
      {hasFavicon ? (
        <img
          src={faviconUrl || undefined}
          alt=""
          width={48}
          height={48}
          className="size-12 object-contain dark:drop-shadow-[0_0_1px_rgba(255,255,255,0.5)]"
          loading="lazy"
          onError={() => setFaviconError(true)}
        />
      ) : (
        <HugeiconsIcon
          icon={Link01Icon}
          className="size-12 text-muted-foreground"
        />
      )}
    </div>
  );

  // Render the media content based on what's available
  const renderMedia = () => {
    // Icon density: show favicon only, centered
    if (showOnlyFavicon) {
      return (
        <div className="flex size-full items-center justify-center bg-muted">
          {hasFavicon ? (
            <img
              src={faviconUrl || undefined}
              alt=""
              width={40}
              height={40}
              className="size-10 object-contain dark:drop-shadow-[0_0_1px_rgba(255,255,255,0.5)]"
              loading="lazy"
              onError={() => setFaviconError(true)}
            />
          ) : (
            <HugeiconsIcon
              icon={Link01Icon}
              className="size-10 text-muted-foreground"
            />
          )}
        </div>
      );
    }

    // YouTube preview
    if (isYouTube && bookmark.media_embed_id) {
      return (
        <YouTubePreview
          embedId={bookmark.media_embed_id}
          title={bookmark.title}
        />
      );
    }

    // Has OG image - show it
    if (hasOgImage) {
      return (
        <img
          src={ogImageUrl || undefined}
          alt={bookmark.title}
          width={300}
          height={169}
          className="size-full object-cover transition-transform group-hover:scale-105"
          loading="lazy"
          onError={() => setOgImageError(true)}
        />
      );
    }

    // Fallback: show styled placeholder with favicon
    return <OgImagePlaceholder />;
  };

  const cardElement = (
    <Card
      className={cn(
        "group flex h-full flex-col overflow-hidden transition-colors",
        "hover:ring-1 hover:ring-primary/50 hover:bg-muted/80",
        "cursor-pointer p-0",
      )}
      onClick={handleOpen}
    >
      {/* Media Section - always maintains aspect ratio */}
      <div
        className={cn("relative w-full shrink-0 overflow-hidden", aspectClass)}
      >
        {renderMedia()}
      </div>

      {/* Content - only shown at normal/comfortable density */}
      {showTitle && (
        <div className={cn("space-y-1", contentPadding)}>
          <h3 className="line-clamp-1 text-sm font-medium">{bookmark.title}</h3>
          {showDescription && bookmark.description && (
            <p className="line-clamp-1 text-xs text-muted-foreground">
              {bookmark.description}
            </p>
          )}
        </div>
      )}
    </Card>
  );

  // Wrap with tooltip only when title is hidden
  const cardWithTooltip = needsTooltip ? (
    <Tooltip>
      <TooltipTrigger
        render={(props) => (
          <div {...props} className="h-full">
            {cardElement}
          </div>
        )}
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
    cardElement
  );

  return (
    <ContextMenu>
      <ContextMenuTrigger
        render={(props) => (
          <div {...props} className="h-full">
            {cardWithTooltip}
          </div>
        )}
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
