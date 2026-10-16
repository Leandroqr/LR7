import type { Metadata } from "next";
import { CatalogPage } from "@/components/pages/catalog-page";
import { getPublicProducts } from "@/lib/catalog";
import { SITE_CONFIG } from "@/lib/site";

export const metadata: Metadata = {
  title: "Training - Ropa Deportiva de Alto Rendimiento",
  description:
    "Descubre ropa deportiva para entrenamientos, gimnasio y actividad física. Camisetas, pantalonetas, buzos y conjuntos de training diseñados para maximizar tu rendimiento.",
  alternates: {
    canonical: "/training",
  },
  openGraph: {
    title: `Training - Ropa Deportiva de Alto Rendimiento | ${SITE_CONFIG.name}`,
    description:
      "Descubre ropa deportiva para entrenamientos, gimnasio y actividad física. Camisetas, pantalonetas, buzos y conjuntos de training diseñados para maximizar tu rendimiento.",
    url: "/training",
    type: "website",
  },
};

type TrainingPageProps = {
  searchParams: Promise<{ cat?: string }>;
};

export default async function TrainingPage({ searchParams }: Readonly<TrainingPageProps>) {
  const [{ cat }, products] = await Promise.all([searchParams, getPublicProducts()]);
  return <CatalogPage initialCategory={cat} brand="TRAINING" products={products} />;
}
