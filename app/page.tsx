import type { Metadata } from "next";
import { HomePage } from "@/components/pages/home-page";
import { getPublicProducts } from "@/lib/catalog";
import { getHomeContent } from "@/lib/content";
import { SITE_CONFIG } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    absolute: `${SITE_CONFIG.name} — Fútbol & Training en Colombia`,
  },
  description: SITE_CONFIG.description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${SITE_CONFIG.name} — Fútbol & Training en Colombia`,
    description: SITE_CONFIG.description,
    url: "/",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_CONFIG.name} — Fútbol & Training en Colombia`,
    description: SITE_CONFIG.description,
  },
};

export default async function Page() {
  const [products, homeContent] = await Promise.all([getPublicProducts(), getHomeContent()]);
  const featuredProduct = products.find((product) => product.slug === "seleccion-colombia") ?? products[0];

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_CONFIG.legalName,
    url: SITE_CONFIG.baseUrl,
    logo: `${SITE_CONFIG.baseUrl}/icon.svg`,
    ...(SITE_CONFIG.whatsappNumber
      ? { sameAs: [`https://wa.me/${SITE_CONFIG.whatsappNumber}`] }
      : {}),
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.baseUrl,
    inLanguage: "es-CO",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_CONFIG.baseUrl}/buscar?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  const featuredProductJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: featuredProduct.name,
    description: featuredProduct.description,
    image: featuredProduct.images.map((image) => image.src),
    brand: {
      "@type": "Brand",
      name: featuredProduct.brandCompany.name,
    },
    category: featuredProduct.category,
    offers: {
      "@type": "Offer",
      priceCurrency: featuredProduct.price.currency,
      price: featuredProduct.price.amount,
      url: `${SITE_CONFIG.baseUrl}/productos/${featuredProduct.slug}`,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      {featuredProduct ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(featuredProductJsonLd) }} /> : null}
      <HomePage products={products} homeSlides={homeContent.slides} homeSections={homeContent.sections} />
    </>
  );
}
