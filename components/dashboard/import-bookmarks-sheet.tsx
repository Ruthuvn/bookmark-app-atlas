"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCategories } from "@/hooks/use-categories";
import { parseNetscapeBookmarksFlat } from "@/lib/bookmarks/netscape";

type CategoryPreview = {
  name: string;
  count: number;
  exists: boolean;
  selected: boolean;
};

interface ImportBookmarksSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportBookmarksSheet({
  open,
  onOpenChange,
}: ImportBookmarksSheetProps) {
  const queryClient = useQueryClient();
  const { data: categories = [] } = useCategories();

  const categoriesKey = categories
    .map((c) => c.name)
    .sort((a, b) => a.localeCompare(b))
    .join("\u0000");

  const existingCategoryNames = useMemo(
    () => new Set(categories.map((c) => c.name)),
    // Depend on content, not array identity.
    [categoriesKey]
  );

  const [file, setFile] = useState<File | null>(null);
  const [previews, setPreviews] = useState<CategoryPreview[]>([]);
  const [skipExisting, setSkipExisting] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [hasUserEditedSelection, setHasUserEditedSelection] = useState(false);

  useEffect(() => {
    if (!open) {
      setFile(null);
      setPreviews([]);
      setSkipExisting(true);
      setIsImporting(false);
      setHasUserEditedSelection(false);
    }
  }, [open]);

  useEffect(() => {
    // Keep conflict state up to date if categories load later.
    setPreviews((prev) => {
      let changed = false;

      const next = prev.map((p) => {
        const exists = existingCategoryNames.has(p.name);
        const selected = !hasUserEditedSelection && exists ? false : p.selected;

        if (exists !== p.exists || selected !== p.selected) {
          changed = true;
          return { ...p, exists, selected };
        }

        return p;
      });

      return changed ? next : prev;
    });
  }, [categoriesKey, existingCategoryNames, hasUserEditedSelection]);

  const enrichMetadata = async (items: Array<{ id: string; url: string }>) => {
    const concurrency = 5;
    let index = 0;

    const worker = async () => {
      while (index < items.length) {
        const current = items[index++];

        try {
          const metaRes = await fetch("/api/fetch-metadata", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: current.url }),
          });

          if (!metaRes.ok) continue;
          const meta = (await metaRes.json()) as {
            og_image_url?: string | null;
            favicon_url?: string | null;
            media_type?: "youtube" | "vimeo" | "default" | null;
            media_embed_id?: string | null;
          };

          await fetch(`/api/bookmarks/${current.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              og_image_url: meta.og_image_url ?? null,
              favicon_url: meta.favicon_url ?? null,
              media_type: (meta.media_type ?? "default") as
                | "youtube"
                | "vimeo"
                | "default",
              media_embed_id: meta.media_embed_id ?? null,
            }),
          });
        } catch {
          // Best-effort metadata enrichment.
        }
      }
    };

    await Promise.all(
      Array.from({ length: Math.min(concurrency, items.length) }, () =>
        worker()
      )
    );

    await queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
  };

  const totalBookmarks = useMemo(
    () => previews.reduce((sum, p) => sum + p.count, 0),
    [previews]
  );

  const selectedCategoryNames = useMemo(
    () => previews.filter((p) => p.selected).map((p) => p.name),
    [previews]
  );

  const selectedBookmarksCount = useMemo(
    () =>
      previews.filter((p) => p.selected).reduce((sum, p) => sum + p.count, 0),
    [previews]
  );

  const allSelected = useMemo(
    () => previews.length > 0 && previews.every((p) => p.selected),
    [previews]
  );

  const someSelected = useMemo(
    () => previews.some((p) => p.selected),
    [previews]
  );

  const onFileChange = async (nextFile: File | null) => {
    setFile(nextFile);
    setPreviews([]);
    setHasUserEditedSelection(false);

    if (!nextFile) return;

    try {
      const html = await nextFile.text();
      const parsed = parseNetscapeBookmarksFlat(html);

      const countByCategory = new Map<string, number>();
      for (const b of parsed) {
        const key = b.categoryName || "Bookmarks";
        countByCategory.set(key, (countByCategory.get(key) ?? 0) + 1);
      }

      const nextPreviews: CategoryPreview[] = Array.from(
        countByCategory.entries()
      )
        .map(([name, count]) => ({
          name,
          count,
          exists: existingCategoryNames.has(name),
          selected: !existingCategoryNames.has(name),
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      setPreviews(nextPreviews);
    } catch {
      toast.error("Failed to read bookmarks file");
      setFile(null);
      setPreviews([]);
    }
  };

  const toggleCategory = (name: string, selected: boolean) => {
    setHasUserEditedSelection(true);
    setPreviews((prev) =>
      prev.map((p) => (p.name === name ? { ...p, selected } : p))
    );
  };

  const handleImport = async () => {
    if (!file) {
      toast.error("Please choose a bookmarks HTML file");
      return;
    }

    if (selectedCategoryNames.length === 0) {
      toast.error("Select at least one folder to import");
      return;
    }

    try {
      setIsImporting(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("categories", JSON.stringify(selectedCategoryNames));
      formData.append("skipExisting", skipExisting ? "true" : "false");

      const res = await fetch("/api/bookmarks/import", {
        method: "POST",
        body: formData,
      });

      const payload = (await res.json()) as
        | {
            imported: number;
            skippedExisting?: number;
            categoriesCreated?: number;
            insertedBookmarks?: Array<{ id: string; url: string }>;
          }
        | { error: string };

      if (!res.ok) {
        throw new Error("error" in payload ? payload.error : "Import failed");
      }

      const imported = "imported" in payload ? payload.imported : 0;
      const skipped =
        "skippedExisting" in payload ? payload.skippedExisting ?? 0 : 0;

      const successMessage =
        skipped > 0
          ? `Imported ${imported} bookmarks (skipped ${skipped} duplicates)`
          : `Imported ${imported} bookmark${imported === 1 ? "" : "s"}`;

      toast.success(successMessage);

      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      await queryClient.invalidateQueries({ queryKey: ["bookmarks"] });

      const inserted =
        "insertedBookmarks" in payload ? payload.insertedBookmarks ?? [] : [];

      if (inserted.length > 0) {
        // Run metadata fetch in the background so imports are fast.
        void enrichMetadata(inserted);
      }

      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Import failed");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex flex-col w-full sm:max-w-lg p-0"
      >
        <SheetHeader className="px-6 py-4 border-b shrink-0">
          <SheetTitle>Import Bookmarks</SheetTitle>
          <SheetDescription>
            Upload your browser bookmarks HTML export and choose which top-level
            folders to import.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="bookmarks-file">Bookmarks HTML file</Label>
            <Input
              id="bookmarks-file"
              type="file"
              accept=".html,text/html"
              onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
            />
            {file && (
              <p className="text-xs text-muted-foreground truncate">
                {file.name}
              </p>
            )}
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              checked={skipExisting}
              onCheckedChange={(v) => setSkipExisting(v === true)}
              aria-label="Skip duplicate URLs"
            />
            <div>
              <p className="text-sm font-medium">Skip duplicates</p>
              <p className="text-xs text-muted-foreground">
                Don’t import bookmarks whose URL you already have.
              </p>
            </div>
          </div>

          {previews.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium">Folders to import</p>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="import-select-all"
                    checked={allSelected}
                    aria-checked={
                      someSelected && !allSelected ? "mixed" : undefined
                    }
                    onCheckedChange={() => {
                      setHasUserEditedSelection(true);
                      setPreviews((prev) =>
                        prev.map((p) => ({ ...p, selected: !allSelected }))
                      );
                    }}
                    aria-label="Select all folders"
                  />
                  <Label
                    htmlFor="import-select-all"
                    className="text-xs text-muted-foreground cursor-pointer"
                  >
                    Select all
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedCategoryNames.length}/{previews.length} selected •{" "}
                  {selectedBookmarksCount}/{totalBookmarks} bookmarks
                </p>
              </div>

              <div className="border divide-y">
                {previews.map((p) => (
                  <div
                    key={p.name}
                    className="flex items-center gap-3 px-3 py-2"
                  >
                    <Checkbox
                      checked={p.selected}
                      onCheckedChange={(v) =>
                        toggleCategory(p.name, v === true)
                      }
                      aria-label={`Import ${p.name}`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.count} bookmark{p.count === 1 ? "" : "s"}
                      </p>
                    </div>
                    {p.exists && <Badge variant="secondary">Existing</Badge>}
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted-foreground">
                Nested folders are flattened into their top-level folder.
              </p>
            </div>
          )}
        </div>

        <SheetFooter className="px-6 py-4 border-t shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isImporting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleImport}
            disabled={
              isImporting || !file || selectedCategoryNames.length === 0
            }
          >
            {isImporting ? "Importing..." : "Import"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
