import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/carrito", "/favoritos", "/buscar"],
    },
    sitemap: `${SITE_CONFIG.baseUrl}/sitemap.xml`,
  };
}
