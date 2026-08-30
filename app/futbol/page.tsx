import type { Metadata } from "next";
import { CatalogPage } from "@/components/pages/catalog-page";
import { getPublicProducts } from "@/lib/catalog";
import { SITE_CONFIG } from "@/lib/site";

export const metadata: Metadata = {
  title: `Fútbol - Camisetas Premium de Fútbol | ${SITE_CONFIG.name}`,
  description:
    "Descubre nuestra colección de camisetas de fútbol premium. Selecciones, clubes, retro y camisetas personalizadas de alto rendimiento.",
  alternates: {
    canonical: "/futbol",
  },
  openGraph: {
    title: `Fútbol - Camisetas Premium de Fútbol | ${SITE_CONFIG.name}`,
    description:
      "Descubre nuestra colección de camisetas de fútbol premium. Selecciones, clubes, retro y camisetas personalizadas de alto rendimiento.",
    url: "/futbol",
    type: "website",
  },
};

type FutbolPageProps = {
  searchParams: Promise<{ cat?: string }>;
};

export default async function FutbolPage({ searchParams }: FutbolPageProps) {
  const [{ cat }, products] = await Promise.all([searchParams, getPublicProducts()]);
  return <CatalogPage initialCategory={cat} brand="FUTBOL" products={products} />;
}
