// Resuelve el origen público del sitio para canonical, Open Graph, sitemap,
// robots y JSON-LD. No se usa para pagos: Wompi lee NEXT_PUBLIC_SITE_URL por su cuenta.
export const LOCAL_SITE_URL = "http://localhost:3000";

type SiteUrlEnv = Readonly<Record<string, string | undefined>>;

function toOrigin(value: string | undefined): string | null {
  const raw = value?.trim();
  if (!raw) return null;
  try {
    const url = new URL(/^[a-z][a-z\d+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (url.username || url.password) return null;
    return url.origin;
  } catch {
    return null;
  }
}

/**
 * Orden: NEXT_PUBLIC_SITE_URL (dominio elegido) → VERCEL_PROJECT_PRODUCTION_URL
 * (dominio de producción que Vercel expone en cada build, también en Preview) → localhost.
 */
export function resolveSiteUrl(env: SiteUrlEnv): string {
  return toOrigin(env.NEXT_PUBLIC_SITE_URL) ?? toOrigin(env.VERCEL_PROJECT_PRODUCTION_URL) ?? LOCAL_SITE_URL;
}
