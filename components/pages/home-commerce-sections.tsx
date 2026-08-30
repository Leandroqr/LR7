import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { formatCurrency } from "@/lib/products";
import type { Product } from "@/types/ecommerce";

const FOOTBALL_COLLECTIONS = [
  { label: "CLUBES", category: "FUTBOL_CLUBES", slug: "futbol-clubes", imageIndex: 0 },
  { label: "SELECCIONES", category: "FUTBOL_SELECCIONES", slug: "futbol-selecciones", imageIndex: 1 },
  { label: "RETRO", category: "FUTBOL_RETRO", slug: "futbol-retro", imageIndex: 2 },
] as const;

const BENEFIT_ITEMS = [
  { id: "football", text: "FOOTBALL FIRST" },
  { id: "training", text: "TRAINING" },
  { id: "custom", text: "PERSONALIZACIÓN DISPONIBLE" },
  { id: "sizes", text: "TALLAS S A XXL" },
] as const;

export function BenefitsStrip() {
  return (
    <section className="benefits-strip" aria-label="Beneficios LR7">
      <div className="benefits-strip-inner">
        <div className="benefits-strip-track">
          {[...BENEFIT_ITEMS, ...BENEFIT_ITEMS].map((item, index) => (
            <span key={`${item.id}-${index}`}>
              <b aria-hidden="true">+</b> {item.text}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export function NewDropSection({ products }: Readonly<{ products: Product[] }>) {
  return (
    <section className="new-drop-section" aria-labelledby="new-drop-title">
      <div className="home-section-header">
        <div>
          <p className="font-display home-section-label">03 / NEW DROP</p>
          <h2 id="new-drop-title" className="font-display home-section-title">NUEVA<br /><span>TEMPORADA.</span></h2>
        </div>
        <Link href="/futbol" className="tertiary-link">VER TODO FÚTBOL <span aria-hidden="true">→</span></Link>
      </div>
      <div className="new-drop-grid">
        {products.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </section>
  );
}

export function FootballCollectionSection({ products }: Readonly<{ products: Product[] }>) {
  return (
    <section className="football-collection-section" aria-labelledby="football-collection-title">
      <div className="home-section-header">
        <div>
          <p className="font-display home-section-label">FOOTBALL / 01</p>
          <h2 id="football-collection-title" className="font-display home-section-title">COMPRA POR<br /><span>CATEGORÍA.</span></h2>
        </div>
        <Link href="/futbol" className="tertiary-link">EXPLORAR FÚTBOL <span aria-hidden="true">→</span></Link>
      </div>
      <div className="football-collection-grid">
        {FOOTBALL_COLLECTIONS.map((collection) => {
          const product = products.find((item) => item.category === collection.category) ?? products[0];
          return (
            <Link key={collection.category} href={`/categorias/${collection.slug}`} className="football-collection-card">
              <div className="football-collection-image"><Image src={product.images[collection.imageIndex % product.images.length].src} alt={product.images[collection.imageIndex % product.images.length].alt} fill sizes="(max-width: 700px) 100vw, 33vw" /></div>
              <div className="football-collection-overlay" />
              <div className="football-collection-content"><p className="font-display">{collection.label}</p><span>VER PRODUCTOS <b aria-hidden="true">→</b></span></div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export function FeaturedProductSection({ product }: Readonly<{ product: Product }>) {
  return (
    <section className="featured-product-section" aria-labelledby="featured-product-title">
      <div className="featured-product-image"><Image src={product.images[0].src} alt={product.images[0].alt} fill sizes="(max-width: 900px) 100vw, 60vw" /></div>
      <div className="featured-product-overlay" />
      <div className="featured-product-content">
        <p className="font-display home-section-label">JERSEY / 07</p>
        <h2 id="featured-product-title" className="font-display">INSPIRED BY<br /><span>THE GAME.</span></h2>
        <p className="featured-product-name">{product.name}</p>
        <p className="featured-product-price">${formatCurrency(product.price.amount)}</p>
        <Link href={`/productos/${product.slug}`} className="btn-primary">VER PRODUCTO <span aria-hidden="true">→</span></Link>
      </div>
    </section>
  );
}

export function WhyLr7Section() {
  const pillars = [
    ["FOOTBALL FIRST", "Nacimos del fútbol."],
    ["PERFORMANCE", "Diseñado para jugar, entrenar y moverse."],
    ["SIMPLE PURCHASE", "Compra fácil y atención directa."],
  ];

  return (
    <section className="why-lr7-section" aria-labelledby="why-lr7-title">
      <div className="why-lr7-heading"><p className="font-display home-section-label">WHY LR7</p><h2 id="why-lr7-title" className="font-display">BUILT FOR<br /><span>THE GAME.</span></h2></div>
      <div className="why-lr7-grid">{pillars.map(([title, text], index) => <div className="why-lr7-item" key={title}><span className="why-lr7-number">0{index + 1}</span><h3 className="font-display">{title}</h3><p>{text}</p></div>)}</div>
    </section>
  );
}

export function CommunitySection() {
  return (
    <section className="community-section" aria-labelledby="community-title">
      <div><p className="font-display home-section-label">LR7 / COMMUNITY</p><h2 id="community-title" className="font-display">THE GAME<br /><span>IS YOURS.</span></h2></div>
      <p className="community-copy">Contenido de la comunidad LR7 próximamente.</p>
      <span className="tertiary-link community-placeholder">FOLLOW LR7 <span aria-hidden="true">→</span></span>
    </section>
  );
}

