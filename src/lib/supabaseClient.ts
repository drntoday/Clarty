import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (supabaseInstance) return supabaseInstance;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn("⚠️ SUPABASE_URL or SUPABASE_KEY is missing in environment variables. Falling back to a stub client.");
    // Return a dummy client proxy to prevent server crash during bootstrap
    return new Proxy({} as SupabaseClient, {
      get: () => {
        return () => {
          throw new Error("Supabase is not configured. Please define SUPABASE_URL and SUPABASE_ANON_KEY first.");
        };
      },
    });
  }

  supabaseInstance = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
  });

  return supabaseInstance;
}
