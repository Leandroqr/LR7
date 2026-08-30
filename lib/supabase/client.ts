"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { SUPABASE_PUBLIC_CONFIG } from "@/lib/supabase/config";

export function createSupabaseBrowserClient() {
  if (!SUPABASE_PUBLIC_CONFIG.url || !SUPABASE_PUBLIC_CONFIG.publishableKey) {
    throw new Error("Supabase public environment variables are not configured.");
  }

  return createBrowserClient<Database>(
    SUPABASE_PUBLIC_CONFIG.url,
    SUPABASE_PUBLIC_CONFIG.publishableKey,
  );
}
