import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductPage } from "@/components/pages/product-page";
import { getPublicProductBySlug, getPublicProducts } from "@/lib/catalog";
import { serializeJsonLd } from "@/lib/seo";
import { SITE_CONFIG } from "@/lib/site";

type ProductRouteProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const products = await getPublicProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublicProductBySlug(slug);

  if (!product) {
    return { title: "Producto no encontrado" };
  }

  return {
    title: product.name,
    description: `${product.description}. Camiseta de futbol premium en Colombia con opcion de personalizacion y diferentes tallas.`,
    alternates: {
      canonical: `/productos/${product.slug}`,
    },
    openGraph: {
      title: `${product.name} | ${SITE_CONFIG.name}`,
      description: `${product.description}. Compra camisetas de futbol premium en Colombia.`,
      images: [product.images[0].src],
      type: "website",
      url: `/productos/${product.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | ${SITE_CONFIG.name}`,
      description: `${product.description}. Camisetas de futbol premium en Colombia.`,
      images: [product.images[0].src],
    },
  };
}

export default async function ProductRoutePage({ params }: Readonly<ProductRouteProps>) {
  const { slug } = await params;
  const products = await getPublicProducts();
  const product = products.find((entry) => entry.slug === slug);

  if (!product) {
    notFound();
  }

  const related = products.filter((entry) => entry.id !== product.id && entry.category === product.category).slice(0, 3);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((image) => image.src),
    sku: product.slug,
    brand: {
      "@type": "Brand",
      name: product.brandCompany.name,
    },
    category: product.category,
    offers: {
      "@type": "Offer",
      priceCurrency: product.price.currency,
      price: product.price.amount,
      url: `${SITE_CONFIG.baseUrl}/productos/${product.slug}`,
    },
  };

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
        name: "Tienda",
        item: `${SITE_CONFIG.baseUrl}/tienda`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: `${SITE_CONFIG.baseUrl}/productos/${product.slug}`,
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(productJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }} />
      <ProductPage product={product} relatedProducts={related} />
    </>
  );
}
