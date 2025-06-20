import { createClient } from "@supabase/supabase-js";

// PUBLIC_INTERFACE
/**
 * Returns an instance of the Supabase client, using environment variables if set—
 * otherwise uses placeholder values for config. Prompt user to add their own real keys.
 */
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

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
