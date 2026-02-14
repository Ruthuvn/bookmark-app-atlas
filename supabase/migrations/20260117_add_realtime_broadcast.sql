-- Migration: Add broadcast triggers for realtime
-- This replaces the less scalable postgres_changes approach

-- Create the broadcast trigger function for bookmarks
CREATE OR REPLACE FUNCTION public.bookmarks_broadcast_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Broadcast to user-specific channel for better scalability
  PERFORM realtime.broadcast_changes(
    'user:' || COALESCE(NEW.user_id, OLD.user_id)::text || ':bookmarks',
    TG_OP,
    TG_OP,
    TG_TABLE_NAME,
    TG_TABLE_SCHEMA,
    NEW,
    OLD
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on bookmarks table
DROP TRIGGER IF EXISTS bookmarks_realtime_broadcast ON public.bookmarks;
CREATE TRIGGER bookmarks_realtime_broadcast
  AFTER INSERT OR UPDATE OR DELETE ON public.bookmarks
  FOR EACH ROW EXECUTE FUNCTION public.bookmarks_broadcast_trigger();

-- RLS policy for realtime.messages (required for private channels)
-- Users can only receive broadcasts for their own bookmarks channel
DROP POLICY IF EXISTS "users_can_receive_bookmark_broadcasts" ON realtime.messages;
CREATE POLICY "users_can_receive_bookmark_broadcasts" ON realtime.messages
  FOR SELECT TO authenticated
  USING (
    -- Allow access to user's own bookmark channel
    topic = 'user:' || (SELECT auth.uid())::text || ':bookmarks'
  );

-- Create index on realtime.messages.topic for faster policy evaluation
-- Note: This may already exist, so we use IF NOT EXISTS pattern
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'realtime' AND indexname = 'idx_messages_topic'
  ) THEN
    CREATE INDEX idx_messages_topic ON realtime.messages(topic);
  END IF;
END $$;

-- Add composite index for common bookmark query pattern
-- Optimizes: SELECT * FROM bookmarks WHERE user_id = ? ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS bookmarks_user_category_created_idx
  ON public.bookmarks(user_id, category_id, created_at DESC);
