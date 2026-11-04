import { createClient } from "@supabase/supabase-js";

/**
 * Returns a Supabase admin client powered by SUPABASE_SERVICE_ROLE_KEY.
 * Only use in server-side API routes for administrative tasks (e.g. permanently deleting auth users).
 * Returns null if SUPABASE_SERVICE_ROLE_KEY is not configured in the environment.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
