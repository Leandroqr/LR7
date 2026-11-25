import type { Metadata } from "next";
import { ShopPage } from "@/components/pages/shop-page";
import { getPublicProducts } from "@/lib/catalog";
import { serializeJsonLd } from "@/lib/seo";
import { SITE_CONFIG } from "@/lib/site";

export const metadata: Metadata = {
  title: "Tienda de camisetas de fútbol",
  description: "Compra camisetas de fútbol LR7: clubes, selecciones y retro. Elige tu talla, personalízala con tu nombre y tu número y recíbela en Colombia.",
  alternates: {
    canonical: "/tienda",
  },
  openGraph: {
    title: "Tienda de camisetas de fútbol | LR7",
    description: "Camisetas de fútbol LR7: clubes, selecciones y retro.",
    url: "/tienda",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tienda de camisetas de fútbol | LR7",
    description: "Explora las camisetas de fútbol LR7.",
  },
};

type TiendaPageProps = {
  searchParams: Promise<{ cat?: string; brand?: string }>;
};

export default async function TiendaPage({ searchParams }: Readonly<TiendaPageProps>) {
  const [{ cat, brand }, products] = await Promise.all([searchParams, getPublicProducts()]);
  const shopUrl = `${SITE_CONFIG.baseUrl.replace(/\/$/, "")}/tienda`;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Tienda LR7",
    description: metadata.description,
    url: shopUrl,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${SITE_CONFIG.baseUrl.replace(/\/$/, "")}/productos/${product.slug}`,
        name: product.name,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
      />
      <ShopPage initialCategory={cat} initialBrand={brand} products={products} />
    </>
  );
}
