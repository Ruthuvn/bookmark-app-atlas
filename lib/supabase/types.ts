import type { Database } from "./database.types";

type PublicSchema = Database["public"];
type Tables = PublicSchema["Tables"];

export type Category = Tables["categories"]["Row"];
export type CategoryInsert = Tables["categories"]["Insert"];
export type CategoryUpdate = Tables["categories"]["Update"];

export type Bookmark = Tables["bookmarks"]["Row"];
export type BookmarkInsert = Tables["bookmarks"]["Insert"];
export type BookmarkUpdate = Tables["bookmarks"]["Update"];

export type UserPreferences = Tables["user_preferences"]["Row"];
export type UserPreferencesInsert = Tables["user_preferences"]["Insert"];
export type UserPreferencesUpdate = Tables["user_preferences"]["Update"];

export type MediaType = "youtube" | "vimeo" | "default";

export type BookmarkWithCategory = Bookmark & {
  category?: Category | null;
};
