import Link from "next/link";
import BookmarkLogo from "@/components/bookmark-logo";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  Search01Icon,
  GridViewIcon,
  ListViewIcon,
  ArrowDown01Icon,
  Home01Icon,
  PlusSignIcon,
  SidebarLeftIcon,
  Copy01Icon,
  MoreVerticalIcon,
} from "@hugeicons/core-free-icons";
import { MOCK_CATEGORIES, MOCK_BOOKMARKS } from "./hero-mock-data";
import { OGPreview } from "./og-preview";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface HeroSectionProps {
  user?: {
    id: string;
    email: string;
    name: string;
    avatar_url?: string;
  } | null;
}

export function HeroSection({ user }: HeroSectionProps) {
  return (
    <section className="bg-background py-28 md:py-40">
      <div className="mx-auto max-w-350 px-4 sm:px-8">
        <div className="mx-auto max-w-6xl text-center">
          <h1 className="text-5xl font-bold leading-tight text-foreground md:text-6xl lg:text-7xl xl:text-8xl [word-spacing:-0.3em]">
            Your bookmarks,{" "}
            <span className="text-primary">organized beautifully</span>
          </h1>
          <p className="mx-auto mt-8 max-w-3xl text-xl text-muted-foreground md:text-2xl">
            Save, categorize, and access from anywhere
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href={user ? "/dashboard" : "/login"}
              className="inline-flex items-center justify-center gap-2 bg-primary px-10 py-5 text-lg font-medium text-primary-foreground hover:bg-primary/90"
            >
              {user ? "Dashboard" : "Get Started"}
              <HugeiconsIcon icon={ArrowRight01Icon} className="h-5 w-5" />
            </Link>
          </div>

          <div className="mt-6 flex items-center justify-center">
            <Link
              href="https://www.devloop.software/"
              target="_blank"
              className="group flex items-center gap-2 border border-border bg-muted/30 px-3 py-1 text-[10px] font-medium tracking-widest uppercase text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
            >
              <span>A Devloop Project</span>
              <div className="h-1 w-1 rounded-full bg-primary/40 group-hover:bg-primary" />
            </Link>
          </div>

          <div className="mt-6 flex items-center justify-center gap-10 text-base text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-primary" />
              <span>Free forever</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-primary" />
              <span>Sign In fast</span>
            </div>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="relative mx-auto mt-6">
          <div className="overflow-hidden border border-border bg-card">
            {/* Mock Browser Chrome */}
            <div className="flex items-center gap-4 border-b border-border bg-muted/50 px-4 py-3 sm:gap-2">
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-400/60" />
              </div>
              <div className="mx-auto w-full max-w-xs flex-1 sm:max-w-md">
                <div className="flex items-center gap-2 border border-border bg-background px-4 py-1.5 text-[10px] text-muted-foreground sm:text-xs">
                  <BookmarkLogo className="h-3 w-3 text-primary" />
                  <span>devatlas.app/dashboard</span>
                </div>
              </div>
            </div>

            {/* Mock Dashboard */}
            <div className="flex">
              {/* Sidebar */}
              <div className="hidden w-56 shrink-0 flex-col border-r border-border bg-muted/20 p-4 lg:flex">
                <div className="flex-1">
                  <div className="mb-6 flex items-center gap-2 px-2">
                    <BookmarkLogo className="h-6 w-6 text-primary" />
                    <span className="text-base font-bold text-foreground">
                      Dev Atlas
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 bg-secondary px-3 py-2 text-xs font-medium text-foreground">
                      <HugeiconsIcon
                        icon={Home01Icon}
                        className="h-3.5 w-3.5"
                      />
                      All Bookmarks
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 text-xs text-muted-foreground">
                      <HugeiconsIcon
                        icon={MOCK_CATEGORIES.development.icon}
                        className="h-3.5 w-3.5"
                        style={{ color: MOCK_CATEGORIES.development.color }}
                      />
                      {MOCK_CATEGORIES.development.name}
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 text-xs text-muted-foreground">
                      <HugeiconsIcon
                        icon={MOCK_CATEGORIES.design.icon}
                        className="h-3.5 w-3.5"
                        style={{ color: MOCK_CATEGORIES.design.color }}
                      />
                      {MOCK_CATEGORIES.design.name}
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 text-xs text-muted-foreground">
                      <HugeiconsIcon
                        icon={MOCK_CATEGORIES.entertainment.icon}
                        className="h-3.5 w-3.5"
                        style={{ color: MOCK_CATEGORIES.entertainment.color }}
                      />
                      {MOCK_CATEGORIES.entertainment.name}
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 text-xs text-muted-foreground">
                      <HugeiconsIcon
                        icon={MOCK_CATEGORIES.productivity.icon}
                        className="h-3.5 w-3.5"
                        style={{ color: MOCK_CATEGORIES.productivity.color }}
                      />
                      {MOCK_CATEGORIES.productivity.name}
                    </div>
                    <div className="mt-4 flex items-center gap-3 px-3 py-2 text-xs text-muted-foreground">
                      <HugeiconsIcon
                        icon={PlusSignIcon}
                        className="h-3.5 w-3.5"
                      />
                      Add Category
                    </div>
                  </div>
                </div>

                {/* Sidebar Footer (Avatar Area) */}
                <div className="mt-auto border-t border-border -mx-4 px-4 pt-4">
                  <div className="flex items-center gap-2 px-2">
                    <Avatar className="h-7 w-7 shrink-0">
                      <AvatarImage src="https://api.dicebear.com/9.x/thumbs/svg?seed=David" />
                      <AvatarFallback className="bg-secondary text-[8px] text-secondary-foreground">
                        SG
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-1 flex-col overflow-hidden leading-tight">
                      <span className="truncate text-[11px] font-semibold text-foreground">
                        Saul Goodman
                      </span>
                      <span className="truncate text-[10px] text-muted-foreground ">
                        saul@mindcave.app
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex flex-1 flex-col pb-8">
                {/* Global Header (Realistic) */}
                <div className="flex h-12 items-center gap-2 border-b border-border bg-card px-4">
                  <HugeiconsIcon
                    icon={SidebarLeftIcon}
                    className="h-4 w-4 text-muted-foreground mr-1"
                  />
                  <div className="h-3 w-px bg-border mx-1" />
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <span>All Bookmarks</span>
                  </div>
                  <div className="flex-1" />
                  <div className="flex items-center gap-2">
                    {/* Command Search Bar (Realistic) */}
                    <div className="hidden items-center gap-2 border border-border bg-muted/40 px-2 py-1 text-muted-foreground sm:flex">
                      <HugeiconsIcon icon={Search01Icon} className="h-3 w-3" />
                      <span className="text-[10px] pr-2">Search...</span>
                      <kbd className="text-[8px] bg-muted px-1 border border-border">
                        ⌘K
                      </kbd>
                    </div>
                    {/* Add Bookmark (Placement matching realism) */}
                    <div className="flex h-7 items-center bg-primary px-3 text-[10px] font-medium text-primary-foreground">
                      <HugeiconsIcon
                        icon={PlusSignIcon}
                        className="h-3 w-3 mr-1"
                      />
                      Add Bookmark
                    </div>
                  </div>
                </div>

                <div className="flex-1 px-4 pt-6 sm:px-8">
                  {/* Content Header (Realistic) */}
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-foreground">
                        All Bookmarks
                      </h2>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        8 bookmarks in total
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <div className="flex h-7 w-7 items-center justify-center bg-secondary text-foreground">
                          <HugeiconsIcon
                            icon={GridViewIcon}
                            className="h-3.5 w-3.5"
                          />
                        </div>
                        <div className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:bg-muted/50">
                          <HugeiconsIcon
                            icon={ListViewIcon}
                            className="h-3.5 w-3.5"
                          />
                        </div>
                      </div>
                      <div className="flex h-7 items-center gap-1 border border-border px-2 text-[10px] text-muted-foreground">
                        <span className="sm:hidden">1 column</span>
                        <span className="hidden sm:inline">4 columns</span>
                        <HugeiconsIcon
                          icon={ArrowDown01Icon}
                          className="h-3 w-3"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {MOCK_BOOKMARKS.map((bookmark, index) => (
                      <div
                        key={index}
                        className={cn(
                          "group flex flex-col overflow-hidden border border-border bg-background transition-all duration-300 hover:border-primary/40 hover:bg-muted/50 hover:shadow-md",
                          index >= 6
                            ? "hidden xl:block"
                            : index >= 4
                            ? "hidden lg:block"
                            : index >= 2
                            ? "hidden sm:block"
                            : null
                        )}
                      >
                        {/* OG Image Simulation */}
                        <OGPreview id={bookmark.id} />
                        {/* Card Info */}
                        <div className="p-3">
                          <div className="flex items-start justify-between gap-4">
                            <h3 className="text-[10px] font-bold text-foreground line-clamp-2 flex-1 leading-tight">
                              {bookmark.title}
                            </h3>
                            <div className="flex items-center gap-2 -mr-1 shrink-0 opacity-60">
                              <HugeiconsIcon
                                icon={bookmark.category.icon}
                                className="h-3 w-3"
                                style={{ color: bookmark.category.color }}
                              />
                              <HugeiconsIcon
                                icon={Copy01Icon}
                                className="h-3 w-3"
                              />
                              <HugeiconsIcon
                                icon={MoreVerticalIcon}
                                className="h-3 w-3"
                              />
                            </div>
                          </div>
                          <p className="mt-2 text-[8px] text-muted-foreground line-clamp-1 leading-tight">
                            {bookmark.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
