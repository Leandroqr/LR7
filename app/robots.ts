import type { MetadataRoute } from "next";
import { ROBOTS_DISALLOW } from "@/lib/robots-rules";
import { SITE_CONFIG } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [...ROBOTS_DISALLOW],
    },
    sitemap: `${SITE_CONFIG.baseUrl}/sitemap.xml`,
  };
}
