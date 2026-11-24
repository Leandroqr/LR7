import Link from "next/link";
import type { Product } from "@/types/ecommerce";
import type { Database } from "@/types/database";
import { HERO_PHOTO_ID, HomeHero } from "@/components/pages/home-hero";
import { HomeTeams } from "@/components/pages/home-teams";
import { FeaturedCarousel } from "@/components/product/featured-carousel";
import { ProductVisual } from "@/components/product/product-visual";
import { CUSTOM_PRICE, formatCurrency } from "@/lib/products";

type HomeSlide = Database["public"]["Tables"]["home_slides"]["Row"];
type HomeSection = Database["public"]["Tables"]["home_sections"]["Row"];

// Líneas de la tienda. La imagen es la foto de un producto real de esa línea (no se inventan fotos).
const LINES: ReadonlyArray<{ label: string; href: string; matches: (product: Product) => boolean }> = [
  { label: "Clubes", href: "/categorias/futbol-clubes", matches: (product) => product.category === "FUTBOL_CLUBES" },
  { label: "Selecciones", href: "/categorias/futbol-selecciones", matches: (product) => product.category === "FUTBOL_SELECCIONES" },
  { label: "Retro", href: "/categorias/futbol-retro", matches: (product) => product.category === "FUTBOL_RETRO" },
  { label: "Training", href: "/training", matches: (product) => product.brand === "TRAINING" },
];

function LinesSection({ products }: Readonly<{ products: Product[] }>) {
  // Se prefiere un producto cuya foto no sea la del hero, para no repetirla dos pantallas seguidas.
  const lines = LINES.map((line) => {
    const candidates = products.filter(line.matches);
    return { ...line, product: candidates.find((product) => !product.images[0]?.src.includes(HERO_PHOTO_ID)) ?? candidates[0] };
  });
  return (
    <section className="home-lines" aria-labelledby="home-lines-title">
      <div className="home-section-head">
        <h2 id="home-lines-title" className="home-headline font-display">Elige tu línea</h2>
        <Link href="/tienda" className="btn-text">Ver toda la tienda</Link>
      </div>
      <ul className="home-lines-grid">
        {lines.map((line) => (
          <li key={line.href}>
            <Link href={line.href} className="home-line-card">
              <span className="home-line-media">
                {line.product ? (
                  <ProductVisual product={line.product} sizes="(max-width: 900px) 50vw, 25vw" className="home-line-photo" />
                ) : null}
              </span>
              <span className="home-line-name font-display">{line.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

// Datos verificados en PRODUCT.md y en el CMS; no se anuncia nada que la tienda no cumpla hoy.
function TrustRow() {
  const items = [
    { title: "Tu nombre y tu número", detail: `Personalización en la espalda por $${formatCurrency(CUSTOM_PRICE)}` },
    { title: "Envíos a toda Colombia", detail: "Entregas promedio de 2 a 5 días hábiles" },
    { title: "Cambios en 5 días hábiles", detail: "Las personalizadas solo por defecto de fábrica" },
    { title: "Tallas S a XXL", detail: "Con guía de medidas en centímetros" },
  ];
  return (
    <section className="home-trust" aria-label="Por qué comprar en LR7">
      <ul className="home-trust-list">
        {items.map((item) => (
          <li key={item.title}>
            <strong>{item.title}</strong>
            <span>{item.detail}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function TrainingSection({ product }: Readonly<{ product: Product }>) {
  return (
    <section className="home-training" aria-labelledby="training-title">
      <div className="home-training-inner">
        <div className="home-training-copy">
          <h2 id="training-title" className="home-headline font-display">Ropa para entrenar</h2>
          <p>Camisetas, camisillas, pantalonetas, buzos y conjuntos para tus sesiones de entrenamiento.</p>
          <div className="home-training-actions">
            <Link href="/training" className="btn-primary">VER TRAINING</Link>
          </div>
        </div>
        <div className="home-training-media">
          <ProductVisual product={product} sizes="(max-width: 900px) 100vw, 50vw" className="home-training-visual" />
        </div>
      </div>
    </section>
  );
}

export function HomePage({ products, homeSlides }: Readonly<{ products: Product[]; homeSlides?: HomeSlide[]; homeSections?: HomeSection[] }>) {
  const footballProducts = products.filter((product) => product.brand === "FUTBOL");
  const trainingProducts = products.filter((product) => product.brand === "TRAINING");
  const newDropProducts = footballProducts.filter((product) => product.badge === "NUEVO");
  const retroProducts = footballProducts.filter((product) => product.category === "FUTBOL_RETRO");
  const remainingFootballProducts = footballProducts.filter((product) => product.badge !== "NUEVO" && product.category !== "FUTBOL_RETRO");
  const featuredProducts = [...newDropProducts, ...retroProducts, ...remainingFootballProducts, ...trainingProducts];
  const trainingProduct = trainingProducts[0];

  return (
    <>
      {/* Hero en carrusel: todas las diapositivas activas del CMS o, si no hay, generadas con productos reales. */}
      <HomeHero products={products} slides={homeSlides} customPrice={CUSTOM_PRICE} />
      <HomeTeams products={products} />
      <LinesSection products={products} />
      <FeaturedCarousel products={featuredProducts} title="Elige tu camiseta" href="/futbol" cta="VER TODO FÚTBOL" />
      <TrustRow />
      {trainingProduct ? <TrainingSection product={trainingProduct} /> : null}
    </>
  );
}
