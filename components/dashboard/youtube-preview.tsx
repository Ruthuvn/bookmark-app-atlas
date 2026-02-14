"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlayIcon } from "@hugeicons/core-free-icons";

interface YouTubePreviewProps {
  embedId: string;
  title: string;
}

/**
 * YouTube Preview Component
 *
 * Displays a clickable YouTube thumbnail with play button overlay.
 * Only renders the actual iframe after user clicks, reducing initial page load.
 */
export function YouTubePreview({ embedId, title }: YouTubePreviewProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  if (isLoaded) {
    return (
      <div className="aspect-video w-full bg-muted">
        <iframe
          src={`https://www.youtube.com/embed/${embedId}?autoplay=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    );
  }

  return (
    <div
      className="aspect-video w-full bg-black relative group cursor-pointer overflow-hidden"
      onClick={(e) => {
        e.stopPropagation();
        setIsLoaded(true);
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setIsLoaded(true);
        }
      }}
      aria-label={`Play ${title}`}
    >
      {/* YouTube Thumbnail */}
      <img
        src={`https://img.youtube.com/vi/${embedId}/mqdefault.jpg`}
        alt={title}
        className="h-full w-full object-cover group-hover:brightness-75 transition-all duration-300"
        loading="lazy"
      />

      {/* Play Button Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-all duration-300">
        <div className="relative flex items-center justify-center">
          {/* Outer circle with glow effect */}
          <div className="absolute inset-0 rounded-full bg-red-600 opacity-90 group-hover:opacity-100 scale-100 group-hover:scale-110 transition-all duration-300 shadow-lg" />
          {/* Play icon */}
          <HugeiconsIcon
            icon={PlayIcon}
            className="h-12 w-12 text-white relative z-10 ml-1"
          />
        </div>
      </div>

      {/* Hint text on hover */}
      <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <p className="text-white text-xs font-medium">Click to play</p>
      </div>
    </div>
  );
}
