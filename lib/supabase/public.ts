import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { isSupabaseConfigured, SUPABASE_PUBLIC_CONFIG } from "@/lib/supabase/config";

/**
 * Cliente anónimo y sin cookies para lecturas públicas (catálogo, CMS, navegación).
 * No lee la sesión, así que no fuerza render dinámico y su resultado se puede cachear.
 * Las políticas RLS `*_public_read` limitan lo que devuelve, igual que para un visitante.
 */
export function createSupabasePublicClient() {
  if (!isSupabaseConfigured()) return null;
  return createClient<Database>(SUPABASE_PUBLIC_CONFIG.url, SUPABASE_PUBLIC_CONFIG.publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
