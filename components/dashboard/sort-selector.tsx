"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Sorting05Icon,
  Tick02Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  TextIcon,
  Clock01Icon,
  RefreshIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useSortPreferences } from "@/hooks/use-preferences";

type SortOption = {
  id: string;
  label: string;
  sortBy: "created_at" | "updated_at" | "title";
  sortOrder: "asc" | "desc";
  icon: typeof Clock01Icon;
};

const SORT_OPTIONS: SortOption[] = [
  {
    id: "newest",
    label: "Newest first",
    sortBy: "created_at",
    sortOrder: "desc",
    icon: Clock01Icon,
  },
  {
    id: "oldest",
    label: "Oldest first",
    sortBy: "created_at",
    sortOrder: "asc",
    icon: Clock01Icon,
  },
  {
    id: "recently_modified",
    label: "Recently modified",
    sortBy: "updated_at",
    sortOrder: "desc",
    icon: RefreshIcon,
  },
  {
    id: "az",
    label: "Name (A-Z)",
    sortBy: "title",
    sortOrder: "asc",
    icon: TextIcon,
  },
  {
    id: "za",
    label: "Name (Z-A)",
    sortBy: "title",
    sortOrder: "desc",
    icon: TextIcon,
  },
];

export function SortSelector() {
  const { sortBy, sortOrder, setSorting } = useSortPreferences();

  const currentOption =
    SORT_OPTIONS.find(
      (o) => o.sortBy === sortBy && o.sortOrder === sortOrder,
    ) || SORT_OPTIONS[0];

  const handleSelect = (option: SortOption) => {
    setSorting(option.sortBy, option.sortOrder);
  };

  return (
    <Tooltip>
      <DropdownMenu>
        <TooltipTrigger
          render={
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-2 px-2 text-xs"
                >
                  <HugeiconsIcon icon={Sorting05Icon} className="size-4" />
                  <span>
                    <span className="text-muted-foreground mr-1">Sort:</span>
                    {currentOption.label}
                  </span>
                </Button>
              }
            />
          }
        />
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuGroup>
            {SORT_OPTIONS.map((option) => {
              const isActive =
                option.sortBy === sortBy && option.sortOrder === sortOrder;
              return (
                <DropdownMenuItem
                  key={option.id}
                  onClick={() => handleSelect(option)}
                  className="gap-2"
                >
                  <HugeiconsIcon
                    icon={option.icon}
                    className={cn(
                      "size-4 shrink-0",
                      isActive ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                  <span className={cn("flex-1", isActive && "font-medium")}>
                    {option.label}
                  </span>
                  {isActive && (
                    <HugeiconsIcon
                      icon={Tick02Icon}
                      className="size-4 text-primary"
                    />
                  )}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <TooltipContent>Sort bookmarks</TooltipContent>
    </Tooltip>
  );
}
