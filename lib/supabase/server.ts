import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";
import { isSupabaseConfigured, SUPABASE_PUBLIC_CONFIG } from "@/lib/supabase/config";

export async function createSupabaseServerClient() {
  if (!isSupabaseConfigured()) return null;

  const cookieStore = await cookies();

  return createServerClient<Database>(
    SUPABASE_PUBLIC_CONFIG.url,
    SUPABASE_PUBLIC_CONFIG.publishableKey,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Session refresh writes are unavailable during Server Component rendering.
          }
        },
      },
    },
  );
}
