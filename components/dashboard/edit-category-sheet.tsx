"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  IconPicker,
  getCategoryIcon,
} from "@/components/dashboard/icon-picker";
import { useUpdateCategory } from "@/hooks/use-categories";
import type { Category } from "@/lib/supabase/types";

interface EditCategorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
}

export function EditCategorySheet({
  open,
  onOpenChange,
  category,
}: EditCategorySheetProps) {
  const [formData, setFormData] = useState({
    name: "",
    icon: "folder",
    color: "#ff6b35",
  });

  const updateCategory = useUpdateCategory();

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        icon: category.icon,
        color: category.color || "#ff6b35",
      });
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) return;

    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      await updateCategory.mutateAsync({
        id: category.id,
        name: formData.name,
        icon: formData.icon,
        color: formData.color,
      });

      toast.success("Category updated successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update category");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex flex-col w-full sm:max-w-lg p-0"
      >
        <SheetHeader className="px-6 py-4 border-b shrink-0">
          <SheetTitle>Edit Category</SheetTitle>
          <SheetDescription>
            Update your category name, icon, or color.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <form
            id="edit-category-form"
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Tech, Learning, Jobs"
              />
            </div>

            {/* Icon Picker */}
            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="flex items-center gap-4 mb-3">
                <div className="flex h-12 w-12 items-center justify-center">
                  <HugeiconsIcon
                    icon={getCategoryIcon(formData.icon)}
                    className="h-6 w-6"
                  />
                </div>
                <span className="text-sm text-muted-foreground">
                  Select an icon for your category
                </span>
              </div>
              <IconPicker
                value={formData.icon}
                onChange={(icon) => setFormData({ ...formData, icon })}
              />
            </div>

            {/* Color */}
            <div className="space-y-2">
              <Label htmlFor="edit-color">Color (Optional)</Label>
              <div className="flex gap-0 border">
                <input
                  id="edit-color"
                  type="color"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  aria-label="Category color picker"
                  title="Category color picker"
                  className="h-8 w-16 cursor-pointer"
                />
                <Input
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  placeholder="#ff6b35"
                  className="flex-1 border-0"
                />
              </div>
            </div>
          </form>
        </div>

        <SheetFooter className="px-6 py-4 border-t shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updateCategory.isPending}
          >
            Cancel
          </Button>
          <Button
            form="edit-category-form"
            type="submit"
            disabled={updateCategory.isPending}
          >
            {updateCategory.isPending ? "Updating..." : "Update Category"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
