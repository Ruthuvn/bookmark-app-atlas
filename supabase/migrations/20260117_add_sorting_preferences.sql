-- Migration: Add sorting preferences to user_preferences
-- Allows users to persist their preferred bookmark sort order

ALTER TABLE public.user_preferences 
ADD COLUMN IF NOT EXISTS sort_by text DEFAULT 'created_at' 
CHECK (sort_by IN ('created_at', 'updated_at', 'title')),
ADD COLUMN IF NOT EXISTS sort_order text DEFAULT 'desc'
CHECK (sort_order IN ('asc', 'desc'));

-- Add index on title for case-insensitive sorting performance if needed
-- But usually sorting is done per user, so a composite index is better
CREATE INDEX IF NOT EXISTS bookmarks_user_id_title_idx ON public.bookmarks (user_id, title);
