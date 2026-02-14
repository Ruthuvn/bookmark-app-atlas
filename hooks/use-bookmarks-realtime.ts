"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

// Singleton client to avoid creating multiple instances
let supabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClient();
  }
  return supabaseClient;
}

/**
 * Subscribes to real-time changes on bookmarks via broadcast.
 * Uses database triggers with realtime.broadcast_changes for scalability.
 * When any INSERT, UPDATE, or DELETE happens, it invalidates
 * the React Query cache so the UI refreshes automatically.
 */
export function useBookmarksRealtime() {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);
  const channelRef = useRef<ReturnType<
    ReturnType<typeof createClient>["channel"]
  > | null>(null);

  // Get the current user ID once
  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
      }
    });
  }, []);

  useEffect(() => {
    if (!userId) return;

    // Check if already subscribed to prevent multiple subscriptions
    if (channelRef.current) return;

    const supabase = getSupabaseClient();

    // Use dedicated topic per user for better scalability
    // Private channel requires RLS policy on realtime.messages
    const channel = supabase.channel(`user:${userId}:bookmarks`, {
      config: {
        broadcast: { self: true },
        private: true,
      },
    });

    channelRef.current = channel;

    // Set auth before subscribing to private channel
    supabase.realtime.setAuth().then(() => {
      channel
        .on("broadcast", { event: "INSERT" }, () => {
          queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
        })
        .on("broadcast", { event: "UPDATE" }, () => {
          queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
        })
        .on("broadcast", { event: "DELETE" }, () => {
          queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
        })
        .subscribe((status, err) => {
          if (status === "CHANNEL_ERROR") {
            console.error("Realtime channel error:", err);
          }
        });
    });

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [queryClient, userId]);
}
