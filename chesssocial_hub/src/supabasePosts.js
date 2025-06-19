/**
 * Supabase API utility: Provides methods to fetch posts, add posts, and subscribe to real-time changes.
 * Assumes there is a 'posts' table with columns: id, img, caption, by, time (number, ms since epoch).
 */
import { supabase } from "./supabaseClient";

// PUBLIC_INTERFACE
export async function fetchPosts({ limit = 30 } = {}) {
  /**
   * Fetch posts (most recent first) from Supabase
   */
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("time", { ascending: false })
    .limit(limit);
  if (error) throw new Error("Failed to fetch posts: " + error.message);
  return data || [];
}

// PUBLIC_INTERFACE
export async function addPost(post) {
  /**
   * Add a post to Supabase. Expects an object with img, caption, by, time.
   */
  const { data, error } = await supabase.from("posts").insert([post]).select();
  if (error) throw new Error("Failed to add post: " + error.message);
  return data?.[0];
}

// PUBLIC_INTERFACE
export function subscribeToPosts({ onInsert, onUpdate, onDelete }) {
  /**
   * Subscribes to real-time changes on the 'posts' table.
   * You can provide callbacks: onInsert, onUpdate, onDelete.
   * Returns the Supabase channel subscription which you can unsubscribe.
   */
  const channel = supabase
    .channel("realtime-posts")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "posts" },
      (payload) => {
        if (payload.eventType === "INSERT" && typeof onInsert === "function") {
          onInsert(payload.new);
        } else if (
          payload.eventType === "UPDATE" &&
          typeof onUpdate === "function"
        ) {
          onUpdate(payload.new);
        } else if (
          payload.eventType === "DELETE" &&
          typeof onDelete === "function"
        ) {
          onDelete(payload.old);
        }
      }
    )
    .subscribe();

  return channel;
}
