import "server-only";

import { unstable_cache } from "next/cache";
import { CACHE_TAGS, PUBLIC_DATA_REVALIDATE_SECONDS } from "@/lib/cache-tags";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import type { Database, Json } from "@/types/database";

export type ContentItem = Database["public"]["Tables"]["content_items"]["Row"];
export type NavigationItem = Database["public"]["Tables"]["navigation_items"]["Row"];
type HomeSlide = Database["public"]["Tables"]["home_slides"]["Row"];
type HomeSection = Database["public"]["Tables"]["home_sections"]["Row"];

class ContentUnavailableError extends Error {}

// Contenido público del CMS: cliente anónimo sin cookies (no fuerza render dinámico)
// y caché con etiqueta. Las funciones internas lanzan ante errores para que
// unstable_cache no guarde un fallo; las públicas devuelven el mismo vacío de antes.
const cacheOptions = { tags: [CACHE_TAGS.content], revalidate: PUBLIC_DATA_REVALIDATE_SECONDS };

function publicClient() {
  const supabase = createSupabasePublicClient();
  if (!supabase) throw new ContentUnavailableError("Supabase no está configurado.");
  return supabase;
}

const getCachedContentItems = unstable_cache(async (pageKey: string): Promise<ContentItem[]> => {
  const { data, error } = await publicClient().from("content_items").select("*").eq("page_key", pageKey).eq("active", true).order("sort_order");
  if (error) throw new ContentUnavailableError(error.message);
  return data;
}, ["lr7-content-items"], cacheOptions);

const getCachedNavigation = unstable_cache(async (): Promise<NavigationItem[]> => {
  const { data, error } = await publicClient().from("navigation_items").select("*").eq("active", true).order("location").order("sort_order");
  if (error) throw new ContentUnavailableError(error.message);
  return data;
}, ["lr7-navigation"], cacheOptions);

const getCachedHomeContent = unstable_cache(async (): Promise<{ slides: HomeSlide[]; sections: HomeSection[] }> => {
  const supabase = publicClient();
  const [slidesResult, sectionsResult] = await Promise.all([
    supabase.from("home_slides").select("*").eq("active", true).order("sort_order"),
    supabase.from("home_sections").select("*").eq("active", true).order("sort_order"),
  ]);
  const error = slidesResult.error ?? sectionsResult.error;
  if (error) throw new ContentUnavailableError(error.message);
  return { slides: slidesResult.data ?? [], sections: sectionsResult.data ?? [] };
}, ["lr7-home-content"], cacheOptions);

const getCachedSiteSetting = unstable_cache(async (key: string): Promise<Json | null> => {
  const { data, error } = await publicClient().from("site_settings").select("value").eq("setting_key", key).eq("active", true).maybeSingle();
  if (error) throw new ContentUnavailableError(error.message);
  return data?.value ?? null;
}, ["lr7-site-setting"], cacheOptions);

export async function getContentItems(pageKey: string): Promise<ContentItem[]> {
  try {
    return await getCachedContentItems(pageKey);
  } catch {
    return [];
  }
}

export async function getPublicNavigation(): Promise<NavigationItem[]> {
  try {
    return await getCachedNavigation();
  } catch {
    return [];
  }
}

export async function getHomeContent(): Promise<{ slides: HomeSlide[]; sections: HomeSection[] }> {
  try {
    return await getCachedHomeContent();
  } catch {
    return { slides: [], sections: [] };
  }
}

export async function getSiteSetting<T extends Json>(key: string): Promise<T | null> {
  try {
    return (await getCachedSiteSetting(key)) as T | null;
  } catch {
    return null;
  }
}
