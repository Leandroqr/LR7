import type { Metadata } from "next";
import { PersonalizationStudio } from "@/components/pages/personalization-studio";
import { getPublicProducts } from "@/lib/catalog";
import { PRODUCTS } from "@/lib/products";
import { SITE_CONFIG } from "@/lib/site";

export const metadata: Metadata = {
  title: "Personaliza tu camiseta de fútbol",
  description:
    "Diseña tu camiseta de fútbol personalizada LR7: elige talla, añade nombre y número, revisa el resultado y conoce el precio antes de comprar.",
  alternates: { canonical: "/personaliza" },
  openGraph: {
    title: `Personaliza tu camiseta de fútbol | ${SITE_CONFIG.name}`,
    description: "Elige tu camiseta, talla, nombre y número en el Custom Studio de LR7.",
    url: "/personaliza",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Personaliza tu camiseta de fútbol | ${SITE_CONFIG.name}`,
    description: "Diseña y revisa tu camiseta personalizada antes de añadirla al carrito.",
  },
};

type PersonalizaPageProps = {
  searchParams: Promise<{ producto?: string }>;
};

export default async function PersonalizaPage({ searchParams }: Readonly<PersonalizaPageProps>) {
  const [{ producto }, catalog] = await Promise.all([searchParams, getPublicProducts()]);
  const catalogProducts = catalog.filter((product) => product.personalizable);
  const products = catalogProducts.length
    ? catalogProducts
    : PRODUCTS.filter((product) => product.personalizable);

  return <PersonalizationStudio products={products} initialProductSlug={producto} />;
}