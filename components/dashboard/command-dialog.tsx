"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link01Icon, PlusSignIcon } from "@hugeicons/core-free-icons";

import {
  CommandDialog as CommandDialogPrimitive,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useCategories } from "@/hooks/use-categories";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { getCategoryIcon } from "@/components/dashboard/icon-picker";
import { getProxiedImageUrl } from "@/lib/image-proxy";
import type { BookmarkWithCategory, Category } from "@/lib/supabase/types";

interface CommandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandDialog({ open, onOpenChange }: CommandDialogProps) {
  const router = useRouter();
  const { data: categories = [] as Category[] } = useCategories();
  const { data: bookmarks = [] as BookmarkWithCategory[] } = useBookmarks();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const runCommand = React.useCallback(
    (command: () => void) => {
      onOpenChange(false);
      command();
    },
    [onOpenChange],
  );

  return (
    <CommandDialogPrimitive
      open={open}
      onOpenChange={onOpenChange}
      title="Search"
      description="Search bookmarks and categories"
    >
      <Command className="**:[[cmdk-group-heading]]:text-muted-foreground **:data-[slot=command-input-wrapper]:h-12">
        <CommandInput placeholder="Search Dashboard..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Actions">
            <CommandItem
              onSelect={() => runCommand(() => router.push("/dashboard"))}
            >
              <HugeiconsIcon icon={Link01Icon} className="mr-2 h-4 w-4" />
              <span>All Bookmarks</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => {})}>
              <HugeiconsIcon icon={PlusSignIcon} className="mr-2 h-4 w-4" />
              <span>Add Bookmark</span>
            </CommandItem>
          </CommandGroup>

          {categories.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Categories">
                {categories.map((category) => (
                  <CommandItem
                    key={category.id}
                    value={category.name}
                    onSelect={() =>
                      runCommand(() =>
                        router.push(`/dashboard?category=${category.id}`),
                      )
                    }
                  >
                    <HugeiconsIcon
                      icon={getCategoryIcon(category.icon)}
                      className="mr-2 h-4 w-4"
                      style={{ color: category.color || undefined }}
                    />
                    <span>{category.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {bookmarks.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Bookmarks">
                {bookmarks.map((bookmark) => (
                  <CommandItem
                    key={bookmark.id}
                    value={`${bookmark.title} ${bookmark.url}`}
                    onSelect={() =>
                      runCommand(() => window.open(bookmark.url, "_blank"))
                    }
                  >
                    {bookmark.favicon_url ? (
                      <img
                        src={
                          getProxiedImageUrl(bookmark.favicon_url) || undefined
                        }
                        alt=""
                        className="mr-2 h-4 w-4 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <HugeiconsIcon
                        icon={Link01Icon}
                        className="mr-2 h-4 w-4"
                      />
                    )}
                    <span>{bookmark.title}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </Command>
    </CommandDialogPrimitive>
  );
}
