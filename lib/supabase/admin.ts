import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { SUPABASE_PUBLIC_CONFIG } from "@/lib/supabase/config";

export function createSupabaseAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!SUPABASE_PUBLIC_CONFIG.url || !serviceRoleKey) {
    throw new Error("Supabase server administration is not configured.");
  }

  return createClient<Database>(SUPABASE_PUBLIC_CONFIG.url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
