import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/ecommerce";
import type { Database } from "@/types/database";
import { HeroCarousel } from "@/components/pages/hero-carousel";
import { BenefitsStrip, FootballCollectionSection, NewDropSection } from "@/components/pages/home-commerce-sections";
import { FeaturedCarousel } from "@/components/product/featured-carousel";

function TrainingSection({ product }: Readonly<{ product: Product }>) {
  return (
    <section aria-labelledby="training-title" style={{ padding: "8rem 0 6rem", background: "var(--color-white)" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 2rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center", minHeight: "500px" }} className="editorial-grid">
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", paddingLeft: "2rem" }}>
            <p className="font-display" style={{ fontSize: "0.75rem", letterSpacing: "0.3em", color: "var(--color-accent)", marginBottom: "1rem", textTransform: "uppercase", fontWeight: 700 }}>
              TRAINING / PRODUCTOS
            </p>
            <h2 id="training-title" className="font-display" style={{ fontSize: "clamp(2.2rem, 6vw, 4rem)", fontWeight: 900, lineHeight: 1, letterSpacing: "-0.01em", textTransform: "uppercase", marginBottom: "1.5rem", color: "var(--color-dark)" }}>
              ROPA PARA<br />ENTRENAR
            </h2>
            <p style={{ fontSize: "1rem", color: "var(--color-text-muted)", lineHeight: 1.8, marginBottom: "2rem", fontWeight: 300, maxWidth: "500px" }}>
              Camisetas, camisillas, pantalonetas, buzos y conjuntos disponibles para tus sesiones de entrenamiento.
            </p>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link href="/training" className="btn-primary">EXPLORAR TRAINING</Link>
              <Link href="/tienda?brand=TRAINING" className="btn-outline">VER PRODUCTOS</Link>
            </div>
          </div>

          <div className="img-zoom" style={{ position: "relative", aspectRatio: "4/5", background: "var(--color-surface)", overflow: "hidden" }}>
            <Image
              src={product.images[0].src}
              alt={product.images[0].alt}
              fill
              sizes="(max-width: 1000px) 100vw, 50vw"
              style={{ objectFit: "cover", filter: "brightness(0.9)" }}
            />
          </div>
        </div>
      </div>
      <style>{`.editorial-grid { grid-template-columns: 1fr 1fr !important; } @media(max-width:1000px) { .editorial-grid { grid-template-columns: 1fr !important; gap: 2rem !important; } } @media(max-width:600px) { .editorial-grid > div:first-child { padding-left: 0 !important; } }`}</style>
    </section>
  );
}

type HomeSlide = Database["public"]["Tables"]["home_slides"]["Row"];
type HomeSection = Database["public"]["Tables"]["home_sections"]["Row"];

function ManagedHomeSections({ sections }: Readonly<{ sections: HomeSection[] }>) {
  return <>{sections.map((section) => <section key={section.id} className="managed-home-section"><div><p className="font-display home-section-label">{section.eyebrow ?? section.section_type}</p><h2 className="font-display home-section-title">{section.title}</h2>{section.subtitle ? <p>{section.subtitle}</p> : null}{section.cta_label && section.cta_href ? <Link href={section.cta_href} className="btn-primary">{section.cta_label}</Link> : null}</div></section>)}</>;
}

export function HomePage({ products, homeSlides, homeSections }: Readonly<{ products: Product[]; homeSlides?: HomeSlide[]; homeSections?: HomeSection[] }>) {
  const footballProducts = products.filter((product) => product.brand === "FUTBOL");
  const trainingProducts = products.filter((product) => product.brand === "TRAINING");
  const newDropProducts = footballProducts.filter((product) => product.badge === "NUEVO");
  const retroProducts = footballProducts.filter((product) => product.category === "FUTBOL_RETRO");
  const remainingFootballProducts = footballProducts.filter((product) => product.badge !== "NUEVO" && product.category !== "FUTBOL_RETRO");
  const featuredProducts = [...newDropProducts, ...retroProducts, ...remainingFootballProducts, ...trainingProducts];
  const trainingProduct = trainingProducts[0];

  return (
    <>
      <HeroCarousel products={products} homeSlides={homeSlides} />
      <FootballCollectionSection products={footballProducts} />
      <FeaturedCarousel
        products={featuredProducts}
        label="PRODUCTOS / DESTACADOS"
        title="ELIGE TU CAMISETA."
        href="/futbol"
        cta="VER TODO FÚTBOL"
      />
      {newDropProducts.length > 0 ? <NewDropSection products={newDropProducts} /> : null}
      <BenefitsStrip />
      {trainingProduct ? <TrainingSection product={trainingProduct} /> : null}
      {homeSections?.length ? <ManagedHomeSections sections={homeSections} /> : null}
    </>
  );
}
