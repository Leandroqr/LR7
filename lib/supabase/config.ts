const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "";

export const SUPABASE_PUBLIC_CONFIG = {
  url: supabaseUrl,
  publishableKey: supabasePublishableKey,
} as const;

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabasePublishableKey);
}
