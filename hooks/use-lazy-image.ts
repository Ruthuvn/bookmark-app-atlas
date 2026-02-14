"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Hook for true lazy loading using Intersection Observer
 * Only loads image when it's about to enter the viewport
 * Much more reliable than native loading="lazy" with grid layouts
 */
export function useLazyImage(src: string | null | undefined) {
  const ref = useRef<HTMLImageElement>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!src || !ref.current) return;

    // Create intersection observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Image is about to enter viewport - load it
            setImageSrc(src);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        // Start loading 50px before image enters viewport
        rootMargin: "50px",
      }
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [src]);

  return { ref, imageSrc };
}
