"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PlusSignIcon,
  Home01Icon,
  DownloadIcon,
  LogoutIcon,
  Settings01Icon,
  Cancel01Icon,
  CursorAddSelection01Icon,
  Edit02Icon,
  Delete02Icon,
  MoreVerticalIcon,
  HelpCircleIcon,
  CheckListIcon,
} from "@hugeicons/core-free-icons";
import { useTheme } from "next-themes";
import { toast } from "sonner";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuAction,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
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
import BookmarkLogo from "@/components/bookmark-logo";
import { useCategories, useDeleteCategory } from "@/hooks/use-categories";
import { getCategoryIcon } from "@/components/dashboard/icon-picker";
import { AddCategorySheet } from "@/components/dashboard/add-category-sheet";
import { EditCategorySheet } from "@/components/dashboard/edit-category-sheet";
import { ImportBookmarksSheet } from "@/components/dashboard/import-bookmarks-sheet";
import { useDashboardTour } from "@/components/dashboard/onboarding";
import type { Category } from "@/lib/supabase/types";

interface AppSidebarProps {
  user: {
    id: string;
    email: string;
    name: string;
    avatar_url?: string;
  };
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategoryId = searchParams.get("category");
  const { state } = useSidebar();
  const { setTheme, theme } = useTheme();
  const { startTour } = useDashboardTour();

  const { data: categories = [], isLoading } = useCategories();
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [importBookmarksOpen, setImportBookmarksOpen] = useState(false);
  const [isSelectingCategories, setIsSelectingCategories] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [deleteDialog, setDeleteDialog] = useState<
    { type: "single"; id: string; name: string } | { type: "bulk" } | null
  >(null);
  const deleteCategory = useDeleteCategory();

  const isCollapsed = state === "collapsed";

  const handleDeleteCategory = (id: string, name: string) => {
    setDeleteDialog({ type: "single", id, name });
  };

  const handleSignOut = async () => {
    const res = await fetch("/api/auth/signout", { method: "POST" });
    if (res.ok) {
      window.location.href = "/";
    }
  };

  const toggleCategorySelection = (id: string) => {
    setSelectedCategoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelectedCategories = () => {
    setSelectedCategoryIds(new Set());
  };

  const confirmDeleteFromDialog = async () => {
    if (!deleteDialog) return;

    const ids =
      deleteDialog.type === "single"
        ? [deleteDialog.id]
        : Array.from(selectedCategoryIds);

    if (ids.length === 0) {
      setDeleteDialog(null);
      return;
    }

    try {
      for (const id of ids) {
        await deleteCategory.mutateAsync(id);
      }

      if (deleteDialog.type === "single") {
        toast.success("Category deleted successfully");
      } else {
        const successMessage = `Deleted ${ids.length} categor${
          ids.length === 1 ? "y" : "ies"
        }`;
        toast.success(successMessage);
      }

      if (currentCategoryId && ids.includes(currentCategoryId)) {
        router.push("/dashboard");
      }

      setDeleteDialog(null);
      clearSelectedCategories();

      if (deleteDialog.type === "bulk") {
        setIsSelectingCategories(false);
      }
    } catch {
      toast.error(
        deleteDialog.type === "single"
          ? "Failed to delete category"
          : "Failed to delete selected categories",
      );
    }
  };

  const selectedCategoryNames = categories
    .filter((c) => selectedCategoryIds.has(c.id))
    .map((c) => c.name);
  const previewNames = selectedCategoryNames.slice(0, 5).join(", ");
  const previewSuffix =
    selectedCategoryNames.length > 5
      ? ` (+${selectedCategoryNames.length - 5} more)`
      : "";

  return (
    <>
      <Sidebar collapsible="icon">
        {/* Header with Logo */}
        <SidebarHeader className="p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                onClick={() => window.open("/", "_blank")}
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground [&_svg]:size-auto"
                data-onboarding="sidebar-logo"
              >
                <BookmarkLogo width={32} height={32} className="shrink-0 text-primary" />
                <span className="truncate font-bold text-lg group-data-[collapsible=icon]:hidden">
                  Dev Atlas
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Library</SidebarGroupLabel>
            {!isSelectingCategories ? (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <SidebarGroupAction
                      type="button"
                      onClick={() => {
                        setIsSelectingCategories(true);
                        setSelectedCategoryIds(new Set());
                      }}
                    />
                  }
                >
                  <HugeiconsIcon
                    icon={CursorAddSelection01Icon}
                    className="h-4 w-4"
                  />
                </TooltipTrigger>
                <TooltipContent side="top">Select categories</TooltipContent>
              </Tooltip>
            ) : (
              <>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <SidebarGroupAction
                        type="button"
                        className="right-15"
                        disabled={
                          selectedCategoryIds.size === 0 ||
                          (deleteCategory as unknown as { isPending?: boolean })
                            .isPending
                        }
                        onClick={() => setDeleteDialog({ type: "bulk" })}
                      />
                    }
                  >
                    <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    {selectedCategoryIds.size === 0
                      ? "Select categories first"
                      : "Delete selected"}
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <SidebarGroupAction
                        type="button"
                        className="right-9"
                        onClick={() => {
                          // Select all categories
                          setSelectedCategoryIds(
                            new Set(categories.map((c) => c.id)),
                          );
                        }}
                      />
                    }
                  >
                    <HugeiconsIcon icon={CheckListIcon} className="h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    Select all categories
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <SidebarGroupAction
                        type="button"
                        onClick={() => {
                          setIsSelectingCategories(false);
                          clearSelectedCategories();
                        }}
                      />
                    }
                  >
                    <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent side="top">Cancel selection</TooltipContent>
                </Tooltip>
              </>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem data-onboarding="all-bookmarks">
                  <SidebarMenuButton
                    onClick={() => router.push("/dashboard")}
                    isActive={pathname === "/dashboard" && !currentCategoryId}
                    tooltip="All Bookmarks"
                  >
                    <HugeiconsIcon icon={Home01Icon} className="h-4 w-4" />
                    <span>All Bookmarks</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {isLoading ? (
                  <>
                    {[1, 2, 3].map((i) => (
                      <SidebarMenuItem key={i}>
                        <div className="flex items-center gap-2 px-2 py-1.5">
                          <Skeleton className="h-4 w-4" />
                          {!isCollapsed && <Skeleton className="h-4 w-24" />}
                        </div>
                      </SidebarMenuItem>
                    ))}
                  </>
                ) : (
                  categories.map((category) => (
                    <SidebarMenuItem key={category.id}>
                      {isSelectingCategories ? (
                        <SidebarMenuButton
                          onClick={() => toggleCategorySelection(category.id)}
                          isActive={selectedCategoryIds.has(category.id)}
                          tooltip={category.name}
                          className="gap-2"
                        >
                          <Checkbox
                            checked={selectedCategoryIds.has(category.id)}
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`Select ${category.name}`}
                          />
                          <HugeiconsIcon
                            icon={getCategoryIcon(category.icon)}
                            className="h-4 w-4"
                            style={
                              category.color
                                ? { color: category.color }
                                : undefined
                            }
                          />
                          <span>{category.name}</span>
                        </SidebarMenuButton>
                      ) : (
                        <>
                          <ContextMenu>
                            <ContextMenuTrigger className="flex flex-1 items-center overflow-hidden">
                              <SidebarMenuButton
                                onClick={() =>
                                  router.push(
                                    `/dashboard?category=${category.id}`,
                                  )
                                }
                                isActive={currentCategoryId === category.id}
                                tooltip={category.name}
                              >
                                <HugeiconsIcon
                                  icon={getCategoryIcon(category.icon)}
                                  className="h-4 w-4"
                                  style={
                                    category.color
                                      ? { color: category.color }
                                      : undefined
                                  }
                                />
                                <span>{category.name}</span>
                              </SidebarMenuButton>
                            </ContextMenuTrigger>
                            <ContextMenuContent side="right" align="start">
                              <ContextMenuItem
                                onClick={() => setEditingCategory(category)}
                              >
                                <HugeiconsIcon
                                  icon={Edit02Icon}
                                  className="mr-2 h-4 w-4"
                                />
                                Edit
                              </ContextMenuItem>
                              <ContextMenuItem
                                onClick={() =>
                                  handleDeleteCategory(
                                    category.id,
                                    category.name,
                                  )
                                }
                                variant="destructive"
                              >
                                <HugeiconsIcon
                                  icon={Delete02Icon}
                                  className="mr-2 h-4 w-4"
                                />
                                Delete
                              </ContextMenuItem>
                            </ContextMenuContent>
                          </ContextMenu>
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={<SidebarMenuAction showOnHover />}
                            >
                              <HugeiconsIcon
                                icon={MoreVerticalIcon}
                                className="h-4 w-4"
                              />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="right" align="start">
                              <DropdownMenuItem
                                onClick={() => setEditingCategory(category)}
                              >
                                <HugeiconsIcon
                                  icon={Edit02Icon}
                                  className="mr-2 h-4 w-4"
                                />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  handleDeleteCategory(
                                    category.id,
                                    category.name,
                                  )
                                }
                                variant="destructive"
                              >
                                <HugeiconsIcon
                                  icon={Delete02Icon}
                                  className="mr-2 h-4 w-4"
                                />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </>
                      )}
                    </SidebarMenuItem>
                  ))
                )}

                {/* Add Category Button */}
                <SidebarMenuItem data-onboarding="add-category">
                  <SidebarMenuButton
                    onClick={() => setAddCategoryOpen(true)}
                    tooltip="Add Category"
                  >
                    <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4" />
                    <span>Add Category</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Footer with User Menu */}
        <SidebarFooter className="border-t">
          <SidebarMenu>
            <SidebarMenuItem data-onboarding="user-menu">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <SidebarMenuButton
                      size="lg"
                      tooltip={user.name}
                      className="data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center"
                    />
                  }
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user.avatar_url} alt={user.name} />
                    <AvatarFallback className="text-xs">
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-xs leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56"
                  side={isCollapsed ? "right" : "top"}
                  align="start"
                  sideOffset={8}
                >
                  <div className="px-2 py-2">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => window.open("/", "_blank")}>
                    <HugeiconsIcon icon={Home01Icon} className="mr-2 h-4 w-4" />
                    Go to Homepage
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      setTheme(theme === "dark" ? "light" : "dark")
                    }
                  >
                    <HugeiconsIcon
                      icon={Settings01Icon}
                      className="mr-2 h-4 w-4"
                    />
                    Toggle Theme
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setImportBookmarksOpen(true)}
                  >
                    <HugeiconsIcon
                      icon={DownloadIcon}
                      className="mr-2 h-4 w-4"
                    />
                    Import Bookmarks
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={startTour}>
                    <HugeiconsIcon
                      icon={HelpCircleIcon}
                      className="mr-2 h-4 w-4"
                    />
                    Start Tour
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <HugeiconsIcon icon={LogoutIcon} className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <AddCategorySheet
        open={addCategoryOpen}
        onOpenChange={setAddCategoryOpen}
      />
      <EditCategorySheet
        open={!!editingCategory}
        onOpenChange={(open) => !open && setEditingCategory(null)}
        category={editingCategory}
      />
      <ImportBookmarksSheet
        open={importBookmarksOpen}
        onOpenChange={setImportBookmarksOpen}
      />

      <AlertDialog
        open={deleteDialog !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteDialog(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteDialog?.type === "bulk"
                ? `Delete ${selectedCategoryIds.size} categories?`
                : deleteDialog?.type === "single"
                  ? `Delete \"${deleteDialog.name}\"?`
                  : "Delete category?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialog?.type === "bulk" ? (
                selectedCategoryIds.size === 0 ? (
                  "Select at least one category to delete."
                ) : (
                  <>
                    Bookmarks in these categories will become uncategorized.
                    {previewNames ? (
                      <>
                        <br />
                        <br />
                        {previewNames}
                        {previewSuffix}
                      </>
                    ) : null}
                  </>
                )
              ) : (
                "Bookmarks in this category will become uncategorized."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={
                (deleteCategory as unknown as { isPending?: boolean }).isPending
              }
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={
                (deleteCategory as unknown as { isPending?: boolean })
                  .isPending ||
                (deleteDialog?.type === "bulk" &&
                  selectedCategoryIds.size === 0)
              }
              onClick={() => {
                void confirmDeleteFromDialog();
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
