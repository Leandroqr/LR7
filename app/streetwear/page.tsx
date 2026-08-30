import type { Metadata } from "next";
import { StreetwearExperience } from "@/components/pages/streetwear-page";
import { getPublicProducts } from "@/lib/catalog";
import { SITE_CONFIG } from "@/lib/site";

const socialImage = "https://images.unsplash.com/photo-1781863074773-836134430654?w=1600&h=900&fit=crop&auto=format";

export const metadata: Metadata = {
  title: "Fútbol para vestir | Camisetas oversize streetwear",
  description: "Camisetas oversize inspiradas en el fútbol y pensadas para tu outfit. Descubre piezas de moda urbana para combinar con denim, cargos y sneakers.",
  alternates: { canonical: "/streetwear" },
  openGraph: {
    title: "El fútbol se viste | LR7 Streetwear",
    description: "Fútbol inspirado en streetwear. Camisetas oversize creadas para vestir, combinar y salir.",
    url: "/streetwear",
    type: "website",
    images: [{ url: socialImage, width: 1600, height: 900, alt: "Camiseta de fútbol integrada en un outfit urbano LR7" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "El fútbol se viste | LR7",
    description: "Camisetas oversize inspiradas en el fútbol, pensadas para tu outfit.",
    images: [socialImage],
  },
};

export default async function StreetwearPage() {
  const products = await getPublicProducts();
  const footballProducts = products.filter((product) => product.brand === "FUTBOL");
  const baseUrl = SITE_CONFIG.baseUrl.replace(/\/$/, "");
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Inicio", item: `${baseUrl}/` },
        { "@type": "ListItem", position: 2, name: "Streetwear", item: `${baseUrl}/streetwear` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "LR7 fútbol inspirado en streetwear",
      description: metadata.description,
      url: `${baseUrl}/streetwear`,
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: footballProducts.length,
        itemListElement: footballProducts.map((product, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: product.name,
          url: `${baseUrl}/productos/${product.slug}`,
        })),
      },
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replaceAll("<", String.raw`\u003c`) }}
      />
      <StreetwearExperience products={products} />
    </>
  );
}