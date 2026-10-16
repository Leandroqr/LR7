import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product/product-card";
import { PageHero } from "@/components/layout/page-hero";
import { getPublicProducts } from "@/lib/catalog";
import { getCategoryBySlug, getCategoryDisplayName, getProductsByCategorySlug } from "@/lib/products";
import { serializeJsonLd } from "@/lib/seo";
import { SITE_CONFIG } from "@/lib/site";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Categoria no encontrada",
    };
  }

  const categoryName = getCategoryDisplayName(category.name);

  return {
    title: categoryName,
    description: `${category.description}. Explora camisetas de futbol premium en Colombia y encuentra tu talla ideal.`,
    alternates: {
      canonical: `/categorias/${slug}`,
    },
    openGraph: {
      title: `${categoryName} | ${SITE_CONFIG.name}`,
      description: `${category.description}. Camisetas de futbol premium en Colombia.`,
      url: `/categorias/${slug}`,
      images: [category.image.src],
    },
    twitter: {
      card: "summary_large_image",
      title: `${categoryName} | ${SITE_CONFIG.name}`,
      description: `${category.description}. Camisetas de futbol premium en Colombia.`,
      images: [category.image.src],
    },
  };
}

export default async function CategoryPage({ params }: Readonly<CategoryPageProps>) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const categoryName = getCategoryDisplayName(category.name);
  const products = getProductsByCategorySlug(slug, await getPublicProducts());

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Inicio",
        item: `${SITE_CONFIG.baseUrl}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Categorias",
        item: `${SITE_CONFIG.baseUrl}/colecciones`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: categoryName,
        item: `${SITE_CONFIG.baseUrl}/categorias/${slug}`,
      },
    ],
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: categoryName,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_CONFIG.baseUrl}/productos/${product.slug}`,
      name: product.name,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(itemListJsonLd) }} />
      <PageHero label="— CATEGORIA" title={categoryName} sub={category.description} />
      <section style={{ padding: "4rem 0 6rem", background: "var(--color-white)" }}>
        <div style={{ maxWidth: "1440px", margin: "0 auto", padding: "0 2rem" }}>
          <p style={{ maxWidth: "860px", margin: "0 0 2rem", color: "var(--color-text-muted)", lineHeight: 1.7, fontWeight: 300 }}>
            Explora {categoryName.toLowerCase()} con diseños exclusivos, diferentes tallas y opciones para compra en Colombia.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(260px, 100%), 1fr))", gap: "2px" }}>
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} imageLoading={index === 0 ? "eager" : "lazy"} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
