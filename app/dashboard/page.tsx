"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Link01Icon,
  PlusSignIcon,
  GridViewIcon,
  ListViewIcon,
  ArrowDown01Icon,
  Tick02Icon,
  CursorAddSelection01Icon,
  CheckListIcon,
  Cancel01Icon,
  Delete02Icon,
  DownloadIcon,
  GridIcon,
  LayoutGridIcon,
} from "@hugeicons/core-free-icons";

import { EditBookmarkSheet } from "@/components/dashboard/edit-bookmark-sheet";
import { AddBookmarkSheet } from "@/components/dashboard/add-bookmark-sheet";
import { ImportBookmarksSheet } from "@/components/dashboard/import-bookmarks-sheet";
import { CategoryGroup } from "@/components/dashboard/category-group";
import { BookmarkGrid } from "@/components/dashboard/bookmark-grid";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useBookmarks, useDeleteBookmark } from "@/hooks/use-bookmarks";
import { useBookmarksRealtime } from "@/hooks/use-bookmarks-realtime";
import { useCategories } from "@/hooks/use-categories";
import { useViewMode, useSortPreferences } from "@/hooks/use-preferences";
import { useIsMobile } from "@/hooks/use-mobile";
import { SortSelector } from "@/components/dashboard/sort-selector";
import { calculateDensity } from "@/lib/density";
import type { BookmarkWithCategory, Category } from "@/lib/supabase/types";

// Mobile column options (1-2 cols)
const MOBILE_COLUMN_OPTIONS = [
  { value: 1, label: "1 column" },
  { value: 2, label: "2 columns" },
];

// Desktop column options for cards
const CARD_COLUMN_OPTIONS = [
  { value: 2, label: "2 columns" },
  { value: 3, label: "3 columns" },
  { value: 4, label: "4 columns" },
  { value: 5, label: "5 columns" },
  { value: 6, label: "6 columns" },
  { value: 7, label: "7 columns" },
  { value: 8, label: "8 columns" },
];

// Desktop column options for lists
const LIST_COLUMN_OPTIONS = [
  { value: 1, label: "1 column" },
  { value: 2, label: "2 columns" },
  { value: 3, label: "3 columns" },
  { value: 4, label: "4 columns" },
  { value: 5, label: "5 columns" },
];

// Group column options (how many category groups per row)
const GROUP_COLUMN_OPTIONS = [
  { value: 1, label: "1 column" },
  { value: 2, label: "2 columns" },
  { value: 3, label: "3 columns" },
];

// Group column classes (for category groups layout)
// Using CSS columns instead of grid for better flow when groups collapse
const GROUP_COLUMN_CLASSES: Record<number, string> = {
  1: "columns-1",
  2: "columns-1 lg:columns-2",
  3: "columns-1 lg:columns-2 xl:columns-3",
};

function DashboardContent() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("category") || undefined;
  const isMobile = useIsMobile();

  const { sortBy, sortOrder } = useSortPreferences();
  const { data: bookmarks = [] as BookmarkWithCategory[], isLoading } =
    useBookmarks(categoryId, sortBy, sortOrder);
  const { data: categories = [] as Category[] } = useCategories();
  const deleteBookmark = useDeleteBookmark();

  // Subscribe to real-time bookmark changes (e.g., from Chrome extension)
  useBookmarksRealtime();

  const {
    viewMode,
    cardColumns,
    listColumns,
    groupColumns,
    setViewMode,
    setCardColumns,
    setListColumns,
    setGroupColumns,
  } = useViewMode(isMobile);

  const [editingBookmark, setEditingBookmark] =
    useState<BookmarkWithCategory | null>(null);
  const [addBookmarkOpen, setAddBookmarkOpen] = useState(false);
  const [importBookmarksOpen, setImportBookmarksOpen] = useState(false);
  const [deletingBookmarkId, setDeletingBookmarkId] = useState<string | null>(
    null,
  );

  // Bookmark multi-select state
  const [isSelectingBookmarks, setIsSelectingBookmarks] = useState(false);
  const [selectedBookmarkIds, setSelectedBookmarkIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [deletingBulk, setDeletingBulk] = useState(false);

  // Get current category name
  const currentCategory = categoryId
    ? categories.find((c) => c.id === categoryId)?.name
    : null;

  const handleEdit = (id: string) => {
    const bookmark = bookmarks.find((b) => b.id === id);
    if (bookmark) {
      setEditingBookmark(bookmark);
    }
  };

  const handleDelete = (id: string) => {
    setDeletingBookmarkId(id);
  };

  const confirmDelete = async () => {
    if (!deletingBookmarkId) return;

    try {
      await deleteBookmark.mutateAsync(deletingBookmarkId);
      toast.success("Bookmark deleted successfully");
    } catch {
      toast.error("Failed to delete bookmark");
    } finally {
      setDeletingBookmarkId(null);
    }
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  // Bookmark multi-select helpers
  const toggleBookmarkSelection = (id: string) => {
    setSelectedBookmarkIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllBookmarks = () => {
    setSelectedBookmarkIds(new Set(bookmarks.map((b) => b.id)));
  };

  const clearSelectedBookmarks = () => {
    setSelectedBookmarkIds(new Set());
  };

  const confirmBulkDelete = async () => {
    const ids = Array.from(selectedBookmarkIds);
    if (ids.length === 0) {
      setDeletingBulk(false);
      return;
    }

    try {
      for (const id of ids) {
        await deleteBookmark.mutateAsync(id);
      }
      const successMessage = `Deleted ${ids.length} bookmark${
        ids.length === 1 ? "" : "s"
      }`;
      toast.success(successMessage);
      clearSelectedBookmarks();
      setIsSelectingBookmarks(false);
    } catch {
      toast.error("Failed to delete selected bookmarks");
    } finally {
      setDeletingBulk(false);
    }
  };

  // Group bookmarks by category for the "All Bookmarks" view
  const groupedBookmarks = !categoryId
    ? categories
        .map((category) => ({
          category,
          bookmarks: bookmarks.filter((b) => b.category_id === category.id),
        }))
        .filter((group) => group.bookmarks.length > 0)
    : null;

  // Find uncategorized bookmarks
  const uncategorizedBookmarks = !categoryId
    ? bookmarks.filter(
        (b) =>
          !b.category_id || !categories.some((c) => c.id === b.category_id),
      )
    : null;

  // Column options based on screen size and view mode
  const columnOptions = isMobile
    ? MOBILE_COLUMN_OPTIONS
    : viewMode === "card"
      ? CARD_COLUMN_OPTIONS
      : LIST_COLUMN_OPTIONS;

  // Group column options - not shown on mobile (always 1 column for groups)
  const groupColumnOptions = GROUP_COLUMN_OPTIONS;

  const currentColumns = viewMode === "card" ? cardColumns : listColumns;

  // Effective group columns: always 1 on mobile
  const effectiveGroupColumns = isMobile ? 1 : groupColumns;

  // Calculate density level based on column settings
  const density = calculateDensity(
    currentColumns,
    effectiveGroupColumns,
    isMobile,
  );

  const handleColumnChange = (cols: number) => {
    if (viewMode === "card") {
      setCardColumns(cols);
    } else {
      setListColumns(cols);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div>
          <Skeleton className="h-9 w-48" />
          <Skeleton className="mt-2 h-5 w-64" />
        </div>
        {/* Controls bar skeleton */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <div className="h-6 w-px bg-border" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-28 hidden md:block" />
          <div className="flex-1" />
          <Skeleton className="h-8 w-8" />
        </div>
        {/* Content skeleton */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-video w-full" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 items-center">
          {/* Row 1 Col 1: Title (Order 1 on all) */}
          <h1 className="text-2xl font-bold md:text-3xl shrink-0 order-1">
            {currentCategory || "All Bookmarks"}
          </h1>

          {/* Row 2 Col 1: Count (Order 2 on Mobile, Order 3 on Desktop) */}
          <p className="text-sm text-muted-foreground order-2 sm:order-3">
            {bookmarks.length === 0
              ? "No bookmarks yet"
              : `${bookmarks.length} bookmark${
                  bookmarks.length === 1 ? "" : "s"
                }`}
          </p>

          {/* Row 1 Col 2: High-level Controls (Order 3 on Mobile, Order 2 on Desktop) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar sm:overflow-visible sm:justify-end order-3 sm:order-2 -ml-2 sm:ml-0 sm:-mr-2">
            {/* Grid Selector */}
            <Tooltip>
              <DropdownMenu>
                <TooltipTrigger
                  render={
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1.5 px-2 text-xs shrink-0"
                          data-onboarding="column-selector"
                        />
                      }
                    />
                  }
                >
                  <HugeiconsIcon icon={GridIcon} className="size-4" />
                  <span className="text-muted-foreground">Grid:</span>
                  {currentColumns}
                  <HugeiconsIcon icon={ArrowDown01Icon} className="h-3 w-3" />
                </TooltipTrigger>
                <DropdownMenuContent align="end">
                  {columnOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => handleColumnChange(option.value)}
                      className="justify-between"
                    >
                      {option.label}
                      {currentColumns === option.value && (
                        <HugeiconsIcon icon={Tick02Icon} className="h-4 w-4" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <TooltipContent side="bottom">Column layout</TooltipContent>
            </Tooltip>

            {/* Group Columns Selector (Desktop only) */}
            {!categoryId && !isMobile && (
              <Tooltip>
                <DropdownMenu>
                  <TooltipTrigger
                    render={
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1.5 px-2 text-xs shrink-0"
                          />
                        }
                      />
                    }
                  >
                    <HugeiconsIcon icon={LayoutGridIcon} className="size-4" />
                    <span className="text-muted-foreground">Groups:</span>
                    {groupColumns}
                    <HugeiconsIcon icon={ArrowDown01Icon} className="h-3 w-3" />
                  </TooltipTrigger>
                  <DropdownMenuContent align="end">
                    {groupColumnOptions.map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => setGroupColumns(option.value)}
                        className="justify-between"
                      >
                        {option.label}
                        {groupColumns === option.value && (
                          <HugeiconsIcon
                            icon={Tick02Icon}
                            className="h-4 w-4"
                          />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <TooltipContent side="bottom">Group layout</TooltipContent>
              </Tooltip>
            )}

            {/* Sort Selector */}
            <div className="shrink-0">
              <SortSelector />
            </div>
          </div>

          {/* Row 2 Col 2: Operational Controls (Order 4 on all) */}
          <div className="flex items-center justify-between sm:justify-end gap-2 order-4 sm:-mr-1.5">
            {/* Mobile View Toggle & Selection container */}
            <div className="flex items-center gap-2 -ml-1.5 sm:ml-0">
              <div
                className="flex items-center gap-1"
                data-onboarding="view-toggle"
              >
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant={viewMode === "card" ? "secondary" : "ghost"}
                        size="icon-sm"
                        onClick={() => setViewMode("card")}
                        aria-label="Card view"
                      />
                    }
                  >
                    <HugeiconsIcon icon={GridViewIcon} className="h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Card view</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant={viewMode === "list" ? "secondary" : "ghost"}
                        size="icon-sm"
                        onClick={() => setViewMode("list")}
                        aria-label="List view"
                      />
                    }
                  >
                    <HugeiconsIcon icon={ListViewIcon} className="h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent side="bottom">List view</TooltipContent>
                </Tooltip>
              </div>

              <div className="h-4 w-px bg-border mx-1" />

              {/* Selection Controls */}
              {bookmarks.length > 0 && (
                <>
                  {!isSelectingBookmarks ? (
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => {
                              setIsSelectingBookmarks(true);
                              clearSelectedBookmarks();
                            }}
                          />
                        }
                      >
                        <HugeiconsIcon
                          icon={CursorAddSelection01Icon}
                          className="h-4 w-4"
                        />
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        Select bookmarks
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <div className="flex items-center gap-1">
                      {selectedBookmarkIds.size > 0 && (
                        <span className="text-[10px] font-mono font-medium bg-primary/10 text-primary px-1.5 py-0.5 border-primary/20 mr-1 shrink-0">
                          {selectedBookmarkIds.size}
                        </span>
                      )}
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              disabled={
                                selectedBookmarkIds.size === 0 ||
                                deleteBookmark.isPending
                              }
                              onClick={() => setDeletingBulk(true)}
                            />
                          }
                        >
                          <HugeiconsIcon
                            icon={Delete02Icon}
                            className="h-4 w-4"
                          />
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          Delete selected
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={selectAllBookmarks}
                            />
                          }
                        >
                          <HugeiconsIcon
                            icon={CheckListIcon}
                            className="h-4 w-4"
                          />
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          Select all
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => {
                                setIsSelectingBookmarks(false);
                                clearSelectedBookmarks();
                              }}
                            />
                          }
                        >
                          <HugeiconsIcon
                            icon={Cancel01Icon}
                            className="h-4 w-4 text-destructive"
                          />
                        </TooltipTrigger>
                        <TooltipContent side="bottom">Cancel</TooltipContent>
                      </Tooltip>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        {bookmarks.length === 0 ? (
          <div className="flex min-h-60 flex-col items-center justify-center gap-4 border border-dashed p-8 text-center md:min-h-80">
            <div className="flex h-16 w-16 items-center justify-center bg-muted">
              <HugeiconsIcon
                icon={Link01Icon}
                className="h-8 w-8 text-muted-foreground"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No bookmarks yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Get started by adding your first bookmark or import from your
                browser
              </p>
            </div>
            <div className="flex gap-2 mt-2">
              <Button onClick={() => setAddBookmarkOpen(true)}>
                <HugeiconsIcon icon={PlusSignIcon} className="mr-2 h-4 w-4" />
                Add Bookmark
              </Button>
              <Button
                variant="secondary"
                onClick={() => setImportBookmarksOpen(true)}
              >
                <HugeiconsIcon icon={DownloadIcon} className="mr-2 h-4 w-4" />
                Import Bookmarks
              </Button>
            </div>
          </div>
        ) : groupedBookmarks ? (
          /* Grouped view for "All Bookmarks" */
          <div
            className={cn(
              "gap-4",
              GROUP_COLUMN_CLASSES[effectiveGroupColumns] || "columns-1",
            )}
          >
            {groupedBookmarks.map(({ category, bookmarks: catBookmarks }) => (
              <CategoryGroup
                key={category.id}
                category={category}
                bookmarkCount={catBookmarks.length}
              >
                <BookmarkGrid
                  bookmarks={catBookmarks}
                  viewMode={viewMode}
                  columns={currentColumns}
                  density={density}
                  isMobile={isMobile}
                  isSelecting={isSelectingBookmarks}
                  selectedIds={selectedBookmarkIds}
                  onToggleSelect={toggleBookmarkSelection}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onCopy={handleCopy}
                />
              </CategoryGroup>
            ))}
            {/* Uncategorized bookmarks */}
            {uncategorizedBookmarks && uncategorizedBookmarks.length > 0 && (
              <CategoryGroup
                category={{
                  id: "uncategorized",
                  name: "Uncategorized",
                  icon: "folder",
                }}
                bookmarkCount={uncategorizedBookmarks.length}
              >
                <BookmarkGrid
                  bookmarks={uncategorizedBookmarks}
                  viewMode={viewMode}
                  columns={currentColumns}
                  density={density}
                  isMobile={isMobile}
                  isSelecting={isSelectingBookmarks}
                  selectedIds={selectedBookmarkIds}
                  onToggleSelect={toggleBookmarkSelection}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onCopy={handleCopy}
                />
              </CategoryGroup>
            )}
          </div>
        ) : (
          /* Flat view for single category */
          <BookmarkGrid
            bookmarks={bookmarks}
            viewMode={viewMode}
            columns={currentColumns}
            density={density}
            isMobile={isMobile}
            isSelecting={isSelectingBookmarks}
            selectedIds={selectedBookmarkIds}
            onToggleSelect={toggleBookmarkSelection}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onCopy={handleCopy}
          />
        )}
      </div>

      <AddBookmarkSheet
        open={addBookmarkOpen}
        onOpenChange={setAddBookmarkOpen}
      />

      <ImportBookmarksSheet
        open={importBookmarksOpen}
        onOpenChange={setImportBookmarksOpen}
      />

      <AlertDialog
        open={!!deletingBookmarkId}
        onOpenChange={(open) => !open && setDeletingBookmarkId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              <span className="font-medium text-foreground">
                &quot;
                {bookmarks.find((b) => b.id === deletingBookmarkId)?.title ||
                  "this bookmark"}
                &quot;
              </span>{" "}
              from your cave.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteBookmark.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              variant="destructive"
              disabled={deleteBookmark.isPending}
            >
              {deleteBookmark.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog
        open={deletingBulk}
        onOpenChange={(open) => !open && setDeletingBulk(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {selectedBookmarkIds.size} bookmark
              {selectedBookmarkIds.size === 1 ? "" : "s"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              selected bookmarks from your cave.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteBookmark.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmBulkDelete();
              }}
              variant="destructive"
              disabled={deleteBookmark.isPending}
            >
              {deleteBookmark.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditBookmarkSheet
        open={!!editingBookmark}
        onOpenChange={(open) => !open && setEditingBookmark(null)}
        bookmark={editingBookmark}
      />
    </>
  );
}

function DashboardLoading() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 items-center">
        <Skeleton className="h-9 w-48 order-1" />
        <Skeleton className="h-5 w-32 order-2 sm:order-3" />
        <div className="flex items-center gap-2 order-3 sm:order-2 sm:justify-end">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="flex items-center gap-2 order-4 sm:justify-end">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <div className="h-4 w-px bg-border mx-1" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-video w-full" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
}
