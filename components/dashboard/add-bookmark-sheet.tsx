"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

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
import { useCreateBookmark } from "@/hooks/use-bookmarks";

interface AddBookmarkSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddBookmarkSheet({
  open,
  onOpenChange,
}: AddBookmarkSheetProps) {
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    description: "",
    media_type: "default" as "youtube" | "vimeo" | "default",
    media_embed_id: "",
    og_image_url: "",
    favicon_url: "",
  });
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);

  const createBookmark = useCreateBookmark();

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
        title: prev.title.trim() ? prev.title : data.title || "",
        description: prev.description.trim()
          ? prev.description
          : data.description || "",
        og_image_url: data.og_image_url || "",
        favicon_url: data.favicon_url || "",
        media_type: data.media_type || "default",
        media_embed_id: data.media_embed_id || "",
      }));
    } catch (error) {
      console.error("Failed to fetch metadata:", error);
    }
  };



  // Fetch metadata when URL changes
  useEffect(() => {
    const fetchMetadata = async () => {
      if (!formData.url) return;

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
  }, [formData.url]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.url.trim()) {
      toast.error("Title and URL are required");
      return;
    }

    try {
      await createBookmark.mutateAsync({
        title: formData.title,
        url: formData.url,
        description: formData.description || undefined,
        og_image_url: formData.og_image_url || null,
        favicon_url: formData.favicon_url || null,
        media_type: formData.media_type,
        media_embed_id: formData.media_embed_id || null,
        user_id: "", // Will be set by API
      });

      toast.success("Bookmark added successfully");
      setFormData({
        title: "",
        url: "",
        description: "",
        media_type: "default",
        media_embed_id: "",
        og_image_url: "",
        favicon_url: "",
      });
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to add bookmark");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex flex-col w-full sm:max-w-lg p-0"
      >
        <SheetHeader className="px-6 py-4 border-b shrink-0">
          <SheetTitle>Add Bookmark</SheetTitle>
          <SheetDescription>
            Save a new link to your collection.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <form
            id="add-bookmark-form"
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* URL */}
            <div className="space-y-2">
              <Label htmlFor="url">URL *</Label>
              <Input
                id="url"
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
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
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
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Optional description"
              />
            </div>
          </form>
        </div>

        <SheetFooter className="px-6 py-4 border-t shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createBookmark.isPending}
          >
            Cancel
          </Button>
          <Button
            form="add-bookmark-form"
            type="submit"
            disabled={createBookmark.isPending}
          >
            {createBookmark.isPending ? "Adding..." : "Add Bookmark"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
