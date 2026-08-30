import type { Metadata } from "next";
import { CollectionsExperience } from "@/components/pages/collections-page";
import { getPublicProducts } from "@/lib/catalog";
import { SITE_CONFIG } from "@/lib/site";

const socialImage = "https://images.unsplash.com/photo-1599204606471-32a75bc663e9?w=1600&h=900&fit=crop&auto=format";

export const metadata: Metadata = {
  title: "Novedades y colecciones de fútbol",
  description: "Descubre las novedades LR7: camisetas de fútbol de nueva temporada, colecciones retro y una selección técnica de training en Colombia.",
  alternates: { canonical: "/colecciones" },
  openGraph: {
    title: "Novedades y colecciones de fútbol | LR7",
    description: "New season has arrived. Descubre camisetas nuevas, fútbol retro y los últimos drops LR7.",
    url: "/colecciones",
    type: "website",
    images: [{ url: socialImage, width: 1600, height: 900, alt: "Novedades de fútbol LR7" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Novedades y colecciones de fútbol | LR7",
    description: "Descubre los nuevos drops de fútbol LR7.",
    images: [socialImage],
  },
};

export default async function CollectionsPage() {
  const products = await getPublicProducts();
  const baseUrl = SITE_CONFIG.baseUrl.replace(/\/$/, "");
  const curatedProducts = products
    .filter((product) => product.badge === "NUEVO" || product.brand === "FUTBOL")
    .slice(0, 8);
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Inicio", item: `${baseUrl}/` },
        { "@type": "ListItem", position: 2, name: "Novedades", item: `${baseUrl}/colecciones` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Novedades y colecciones LR7",
      description: metadata.description,
      url: `${baseUrl}/colecciones`,
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: curatedProducts.length,
        itemListElement: curatedProducts.map((product, index) => ({
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, String.raw`\u003c`) }}
      />
      <CollectionsExperience products={products} />
    </>
  );
}
