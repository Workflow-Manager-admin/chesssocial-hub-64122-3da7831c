import { createClient } from "@supabase/supabase-js";

// PUBLIC_INTERFACE
/**
 * Returns an instance of the Supabase client, using environment variables if set—
 * otherwise uses placeholder values for config. Prompt user to add their own real keys.
 * Defensive: Will fallback to dummy client if createClient fails (SSR, env, or runtime).
 */
let supabase;
try {
  const supabaseUrl =
    (typeof process !== "undefined" &&
      process.env &&
      process.env.REACT_APP_SUPABASE_URL) ||
    "<YOUR_SUPABASE_URL>";
  const supabaseAnonKey =
    (typeof process !== "undefined" &&
      process.env &&
      process.env.REACT_APP_SUPABASE_ANON_KEY) ||
    "<YOUR_SUPABASE_ANON_KEY>";
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.startsWith("<")) {
    throw new Error("Supabase config missing. Please add your credentials for full functionality.");
  }
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} catch (e) {
  // Fallback dummy client to avoid runtime crash on missing config, SSR, or tests
  supabase = {
    from: () => ({ select: async () => ({ data: [], error: null }), insert: async () => ({ data: [], error: null }) }),
    channel: () => ({ on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }) })
  };
}

export { supabase };
