"use client";

import React, { useRef, useState, useEffect, ReactNode } from "react";

interface LazyRenderProps {
  children: ReactNode;
  placeholder?: ReactNode;
  rootMargin?: string; // Default: "200px 0px" - preload 200px before visible
  threshold?: number; // Default: 0 - trigger when any part is visible
  minHeight?: string | number; // Prevent layout shift
  className?: string;
}

export function LazyRender({
  children,
  placeholder,
  rootMargin = "200px 0px",
  threshold = 0,
  minHeight,
  className,
}: LazyRenderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (shouldRender) return;

    const element = containerRef.current;
    if (!element) return;

    // Fallback for browsers without IntersectionObserver
    if (!("IntersectionObserver" in window)) {
      const timer = setTimeout(() => setShouldRender(true), 100);
      return () => clearTimeout(timer);
    }

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true);
          observerRef.current?.disconnect();
        }
      },
      { rootMargin, threshold }
    );

    observerRef.current.observe(element);

    return () => observerRef.current?.disconnect();
  }, [rootMargin, threshold, shouldRender]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={
        !shouldRender && minHeight
          ? {
              minHeight:
                typeof minHeight === "number" ? `${minHeight}px` : minHeight,
            }
          : undefined
      }
    >
      {shouldRender ? children : placeholder}
    </div>
  );
}
