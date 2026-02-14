import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  BookmarkWithCategory,
  BookmarkInsert,
  BookmarkUpdate,
} from "@/lib/supabase/types";

export function useBookmarks(
  categoryId?: string,
  sortBy: "created_at" | "updated_at" | "title" = "created_at",
  sortOrder: "asc" | "desc" = "desc",
) {
  return useQuery({
    queryKey: ["bookmarks", categoryId, sortBy, sortOrder],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (categoryId) params.append("category", categoryId);
      params.append("sort_by", sortBy);
      params.append("sort_order", sortOrder);

      const res = await fetch(`/api/bookmarks?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch bookmarks");
      return res.json() as Promise<BookmarkWithCategory[]>;
    },
    placeholderData: (previousData) => previousData,
  });
}

export function useCreateBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BookmarkInsert) => {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create bookmark");
      return res.json() as Promise<BookmarkWithCategory>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
  });
}

export function useUpdateBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: BookmarkUpdate & { id: string }) => {
      const res = await fetch(`/api/bookmarks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update bookmark");
      return res.json() as Promise<BookmarkWithCategory>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
  });
}

export function useDeleteBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/bookmarks/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete bookmark");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
  });
}
