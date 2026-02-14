"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateBookmark } from "@/hooks/use-bookmarks";
import { useCategories } from "@/hooks/use-categories";
import { getCategoryIcon } from "@/components/dashboard/icon-picker";
import type { BookmarkWithCategory } from "@/lib/supabase/types";

interface EditBookmarkSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookmark: BookmarkWithCategory | null;
}

export function EditBookmarkSheet({
  open,
  onOpenChange,
  bookmark,
}: EditBookmarkSheetProps) {
  const [formData, setFormData] = useState<{
    title: string;
    url: string;
    description: string;
    category_id: string;
    og_image_url: string;
    favicon_url: string;
    media_type: "youtube" | "vimeo" | "default";
    media_embed_id: string;
  }>({
    title: "",
    url: "",
    description: "",
    category_id: "",
    og_image_url: "",
    favicon_url: "",
    media_type: "default",
    media_embed_id: "",
  });
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const [initialUrl, setInitialUrl] = useState("");
  const [isUploadingOg, setIsUploadingOg] = useState(false);
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);
  const [hasCustomOg, setHasCustomOg] = useState(false);
  const [hasCustomFavicon, setHasCustomFavicon] = useState(false);

  const updateBookmark = useUpdateBookmark();
  const { data: categories = [] } = useCategories();

  const fetchMetadataForUrl = async (rawUrl: string) => {
    try {
      const response = await fetch("/api/fetch-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: rawUrl }),
      });

      if (!response.ok) return;
      const data = await response.json();

      setFormData((prev) => ({
        ...prev,
        // Only auto-fill title if it's empty
        title: prev.title.trim() ? prev.title : data.title || "",
        // Only auto-fill description if it's empty
        description: prev.description.trim()
          ? prev.description
          : data.description || "",
        og_image_url: hasCustomOg ? prev.og_image_url : data.og_image_url || "",
        favicon_url: hasCustomFavicon
          ? prev.favicon_url
          : data.favicon_url || "",
        media_type:
          (data.media_type as "youtube" | "vimeo" | "default") || "default",
        media_embed_id: data.media_embed_id || "",
      }));
    } catch (error) {
      console.error("Failed to fetch metadata:", error);
    }
  };

  const uploadCustom = async (kind: "ogimage" | "favicon", file: File) => {
    if (!formData.url) {
      toast.error("Set the URL first");
      return;
    }

    try {
      new URL(formData.url);
    } catch {
      toast.error("Enter a valid URL first");
      return;
    }

    const form = new FormData();
    form.set("kind", kind);
    form.set("url", formData.url);
    form.set("file", file);

    if (kind === "ogimage") setIsUploadingOg(true);
    else setIsUploadingFavicon(true);

    try {
      const res = await fetch("/api/storage/upload", {
        method: "POST",
        body: form,
      });
      const payload = await res.json();

      console.log("Upload response:", {
        ok: res.ok,
        status: res.status,
        payload,
      });

      if (!res.ok) {
        throw new Error(payload?.error || "Upload failed");
      }

      if (!payload.publicUrl) {
        throw new Error("No public URL in response");
      }

      if (kind === "ogimage") {
        setFormData((prev) => ({ ...prev, og_image_url: payload.publicUrl }));
        setHasCustomOg(true);
      } else {
        setFormData((prev) => ({ ...prev, favicon_url: payload.publicUrl }));
        setHasCustomFavicon(true);
      }

      toast.success(
        kind === "ogimage"
          ? "Custom OG image uploaded"
          : "Custom favicon uploaded"
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      if (kind === "ogimage") setIsUploadingOg(false);
      else setIsUploadingFavicon(false);
    }
  };

  useEffect(() => {
    if (bookmark) {
      setFormData({
        title: bookmark.title,
        url: bookmark.url,
        description: bookmark.description || "",
        category_id: bookmark.category_id || "",
        og_image_url: bookmark.og_image_url || "",
        favicon_url: bookmark.favicon_url || "",
        media_type:
          (bookmark.media_type as "youtube" | "vimeo" | "default") || "default",
        media_embed_id: bookmark.media_embed_id || "",
      });
      setInitialUrl(bookmark.url);

      // Heuristic: if the stored URL points at our public buckets, treat it as custom.
      // (We avoid schema changes by inferring from the URL.)
      const og = bookmark.og_image_url || "";
      const fav = bookmark.favicon_url || "";
      setHasCustomOg(og.includes("/storage/v1/object/public/ogimage/"));
      setHasCustomFavicon(fav.includes("/storage/v1/object/public/favicon/"));
    }
  }, [bookmark]);

  // Fetch metadata when URL changes (but not on initial load)
  useEffect(() => {
    const fetchMetadata = async () => {
      if (!formData.url || formData.url === initialUrl) return;

      // Basic URL validation
      try {
        new URL(formData.url);
      } catch {
        return;
      }

      setIsFetchingMetadata(true);

      try {
        await fetchMetadataForUrl(formData.url);
      } catch (error) {
        console.error("Failed to fetch metadata:", error);
      } finally {
        setIsFetchingMetadata(false);
      }
    };

    const debounce = setTimeout(fetchMetadata, 500);
    return () => clearTimeout(debounce);
  }, [formData.url, initialUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookmark) return;

    if (!formData.title.trim() || !formData.url.trim()) {
      toast.error("Title and URL are required");
      return;
    }

    try {
      await updateBookmark.mutateAsync({
        id: bookmark.id,
        title: formData.title,
        url: formData.url,
        description: formData.description || undefined,
        category_id: formData.category_id || null,
        og_image_url: formData.og_image_url || null,
        favicon_url: formData.favicon_url || null,
        media_type: formData.media_type,
        media_embed_id: formData.media_embed_id || null,
      });

      toast.success("Bookmark updated successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update bookmark");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex flex-col w-full sm:max-w-lg p-0"
      >
        <SheetHeader className="px-6 py-4 border-b shrink-0">
          <SheetTitle>Edit Bookmark</SheetTitle>
          <SheetDescription>Update your bookmark details.</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <form
            id="edit-bookmark-form"
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* URL */}
            <div className="space-y-2">
              <Label htmlFor="edit-url">URL *</Label>
              <Input
                id="edit-url"
                type="url"
                required
                value={formData.url}
                onChange={(e) =>
                  setFormData({ ...formData, url: e.target.value })
                }
                placeholder="https://example.com"
              />
              {isFetchingMetadata && (
                <p className="text-xs text-muted-foreground">
                  Fetching metadata...
                </p>
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter bookmark title"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Optional description"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select
                value={formData.category_id || "uncategorized"}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    category_id: value === "uncategorized" ? "" : value ?? "",
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {formData.category_id ? (
                      <div className="flex items-center gap-2">
                        <HugeiconsIcon
                          icon={getCategoryIcon(
                            categories.find(
                              (c) => c.id === formData.category_id
                            )?.icon || "folder-01"
                          )}
                          className="h-4 w-4"
                          style={{
                            color:
                              categories.find(
                                (c) => c.id === formData.category_id
                              )?.color || undefined,
                          }}
                        />
                        <span>
                          {
                            categories.find(
                              (c) => c.id === formData.category_id
                            )?.name
                          }
                        </span>
                      </div>
                    ) : (
                      "Uncategorized"
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uncategorized">Uncategorized</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <HugeiconsIcon
                          icon={getCategoryIcon(category.icon)}
                          className="h-4 w-4"
                          style={{ color: category.color || undefined }}
                        />
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom media */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-custom-og">
                  Custom OG image (optional)
                </Label>
                <Input
                  id="edit-custom-og"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={isUploadingOg || updateBookmark.isPending}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadCustom("ogimage", f);
                  }}
                />
                <div className="flex items-center justify-between">
                  {hasCustomOg ? (
                    <p className="text-xs text-muted-foreground">
                      Using your uploaded OG image.
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      If empty, we'll fetch it automatically.
                    </p>
                  )}
                  {hasCustomOg && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={isFetchingMetadata}
                      onClick={async () => {
                        setHasCustomOg(false);
                        setFormData((prev) => ({ ...prev, og_image_url: "" }));
                        if (formData.url) {
                          setIsFetchingMetadata(true);
                          await fetchMetadataForUrl(formData.url);
                          setIsFetchingMetadata(false);
                        }
                      }}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-custom-favicon">
                  Custom favicon (optional)
                </Label>
                <Input
                  id="edit-custom-favicon"
                  type="file"
                  accept="image/png,image/x-icon,image/vnd.microsoft.icon,image/svg+xml"
                  disabled={isUploadingFavicon || updateBookmark.isPending}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadCustom("favicon", f);
                  }}
                />
                <div className="flex items-center justify-between">
                  {hasCustomFavicon ? (
                    <p className="text-xs text-muted-foreground">
                      Using your uploaded favicon.
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      If empty, we'll fetch it automatically.
                    </p>
                  )}
                  {hasCustomFavicon && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={isFetchingMetadata}
                      onClick={async () => {
                        setHasCustomFavicon(false);
                        setFormData((prev) => ({ ...prev, favicon_url: "" }));
                        if (formData.url) {
                          setIsFetchingMetadata(true);
                          await fetchMetadataForUrl(formData.url);
                          setIsFetchingMetadata(false);
                        }
                      }}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>

        <SheetFooter className="px-6 py-4 border-t shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updateBookmark.isPending}
          >
            Cancel
          </Button>
          <Button
            form="edit-bookmark-form"
            type="submit"
            disabled={updateBookmark.isPending}
          >
            {updateBookmark.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
