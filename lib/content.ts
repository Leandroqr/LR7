import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database, Json } from "@/types/database";

export type ContentItem = Database["public"]["Tables"]["content_items"]["Row"];
export type NavigationItem = Database["public"]["Tables"]["navigation_items"]["Row"];

export async function getContentItems(pageKey: string): Promise<ContentItem[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("content_items").select("*").eq("page_key", pageKey).eq("active", true).order("sort_order");
  return error ? [] : data;
}

export async function getPublicNavigation(): Promise<NavigationItem[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("navigation_items").select("*").eq("active", true).order("location").order("sort_order");
  return error ? [] : data;
}

export async function getHomeContent() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { slides: [], sections: [] };
  const [slidesResult, sectionsResult] = await Promise.all([
    supabase.from("home_slides").select("*").eq("active", true).order("sort_order"),
    supabase.from("home_sections").select("*").eq("active", true).order("sort_order"),
  ]);
  return { slides: slidesResult.error ? [] : slidesResult.data, sections: sectionsResult.error ? [] : sectionsResult.data };
}

export async function getSiteSetting<T extends Json>(key: string): Promise<T | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("site_settings").select("value").eq("setting_key", key).eq("active", true).maybeSingle();
  return error || !data ? null : data.value as T;
}