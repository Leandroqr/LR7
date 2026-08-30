import type { Metadata } from "next";
import { ShopPage } from "@/components/pages/shop-page";
import { getPublicProducts } from "@/lib/catalog";
import { SITE_CONFIG } from "@/lib/site";

export const metadata: Metadata = {
  title: "Tienda de camisetas de fútbol y training",
  description: "Compra camisetas de fútbol, ediciones retro y ropa de training LR7. Elige tu talla, personaliza productos seleccionados y recibe en Colombia.",
  alternates: {
    canonical: "/tienda",
  },
  openGraph: {
    title: "Tienda de camisetas de fútbol y training | LR7",
    description: "Fútbol primero: camisetas, ediciones retro y ropa técnica de training LR7.",
    url: "/tienda",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tienda de camisetas de fútbol y training | LR7",
    description: "Explora camisetas de fútbol, retro y training LR7.",
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, String.raw`\u003c`) }}
      />
      <ShopPage initialCategory={cat} initialBrand={brand} products={products} />
    </>
  );
}
