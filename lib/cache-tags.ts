// Etiquetas de la caché de datos públicos. El admin las invalida al guardar
// (app/admin/actions.ts → revalidatePublicSite) y caducan solas tras PUBLIC_DATA_REVALIDATE_SECONDS
// por si alguien edita directamente en Supabase.
export const CACHE_TAGS = {
  catalog: "lr7:catalog",
  content: "lr7:content",
} as const;

export const PUBLIC_DATA_REVALIDATE_SECONDS = 300;
