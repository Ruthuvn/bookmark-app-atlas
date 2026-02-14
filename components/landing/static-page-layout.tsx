"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import BookmarkLogo from "@/components/bookmark-logo";
import { Footer } from "@/components/landing/footer";

interface StaticPageLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function StaticPageLayout({
  title,
  subtitle,
  children,
}: StaticPageLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="relative z-10 flex-1">
        <div className="mx-auto max-w-4xl px-4 sm:px-8 py-12 md:py-20 font-sans">
          {/* Back button */}
          <Link
            href="/"
            className="group mb-12 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-all duration-300 hover:text-foreground"
          >
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              className="h-4 w-4 transition-transform group-hover:-translate-x-1"
            />
            Back to home
          </Link>

          {/* Header section (Hero style) */}
          <div className="mb-20">
            <div className="mb-8 inline-flex items-center gap-3">
              <BookmarkLogo className="h-10 w-10 text-primary" />
              <span className="text-xl font-bold tracking-tight text-foreground">
                Dev Atlas
              </span>
            </div>

            <h1 className="text-5xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl">
              {title}
            </h1>
            <p className="mt-8 text-xl leading-relaxed text-muted-foreground max-w-2xl">
              {subtitle}
            </p>
          </div>

          {/* Prose Content */}
          <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
            {children}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
