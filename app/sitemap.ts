import type { MetadataRoute } from "next";
import { getPublicProducts } from "@/lib/catalog";
import { CATEGORIES, getProductsByCategorySlug } from "@/lib/products";
import { isPublicHrefEnabled } from "@/lib/store-scope";
import { SITE_CONFIG } from "@/lib/site";

const staticRoutes = [
  "",
  "/futbol",
  "/streetwear",
  "/training",
  "/tienda",
  "/colecciones",
  "/personaliza",
  "/nosotros",
  "/contacto",
  "/envios",
  "/cambios-y-devoluciones",
  "/preguntas-frecuentes",
  "/guia-de-tallas",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const products = await getPublicProducts();

  // Solo secciones visibles (Training y Streetwear ocultos por alcance) y categorías con productos.
  const staticEntries: MetadataRoute.Sitemap = staticRoutes.filter((path) => isPublicHrefEnabled(path || "/")).map((path) => ({
    url: `${SITE_CONFIG.baseUrl}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  const categoryEntries: MetadataRoute.Sitemap = CATEGORIES.filter((category) => getProductsByCategorySlug(category.slug, products).length > 0).map((category) => ({
    url: `${SITE_CONFIG.baseUrl}/categorias/${category.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_CONFIG.baseUrl}/productos/${product.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticEntries, ...categoryEntries, ...productEntries];
}
