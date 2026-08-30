"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { ProductCard } from "@/components/product/product-card";
import { formatCurrency } from "@/lib/products";
import type { Product } from "@/types/ecommerce";

type CollectionsPageProps = {
  products: Product[];
};

type EditorialCollection = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  href: string;
  product: Product;
};

const CAMPAIGN_IMAGES = {
  hero: {
    src: "https://images.unsplash.com/photo-1599204606471-32a75bc663e9?w=1800&h=1100&fit=crop&auto=format",
    alt: "Futbolista en la cancha durante una sesión nocturna",
  },
  drop: {
    src: "https://images.unsplash.com/photo-1490108474814-221f6198acc5?w=1600&h=1200&fit=crop&auto=format",
    alt: "Jugador de fútbol visto a través de la red del arco",
  },
} as const;

function getEditorialProducts(products: Product[]) {
  const football = products.filter((product) => product.brand === "FUTBOL");
  const training = products.filter((product) => product.brand === "TRAINING");
  const newFootball = football.filter((product) => product.badge === "NUEVO");
  const limitedFootball = football.filter((product) => product.badge === "LIMITADA");
  const featuredFootball = football.filter(
    (product) => product.badge !== "NUEVO" && product.badge !== "LIMITADA",
  );
  const newTraining = training.filter((product) => product.badge === "NUEVO");
  const arrivals = [
    ...newFootball,
    ...limitedFootball,
    ...featuredFootball,
    ...newTraining,
    ...training.filter((product) => product.badge !== "NUEVO"),
  ].slice(0, 8);

  return { football, training, newFootball, arrivals };
}

function findProduct(products: Product[], predicate: (product: Product) => boolean, fallback: Product) {
  return products.find(predicate) ?? fallback;
}

export function CollectionsExperience({ products }: Readonly<CollectionsPageProps>) {
  const { football, training, newFootball, arrivals } = getEditorialProducts(products);
  const heroProduct = newFootball[0] ?? football[0] ?? products[0];
  const retroProduct = findProduct(football, (product) => product.category === "FUTBOL_RETRO", heroProduct);
  const essentialsProduct = findProduct(
    football,
    (product) => product.category === "FUTBOL_CLUBES" || product.category === "FUTBOL_SELECCIONES",
    heroProduct,
  );
  const trainingProduct = training[0] ?? heroProduct;
  const collections: EditorialCollection[] = [
    {
      id: "season",
      eyebrow: "01 / JUST DROPPED",
      title: "NUEVA TEMPORADA",
      description: "Lo último del fútbol, listo para salir a la cancha.",
      cta: "VER NUEVA TEMPORADA",
      href: "/tienda?cat=NUEVO",
      product: heroProduct,
    },
    {
      id: "retro",
      eyebrow: "02 / ARCHIVE",
      title: "RETRO",
      description: "The game never forgets. Camisetas que siguen haciendo historia.",
      cta: "EXPLORAR RETRO",
      href: "/tienda?cat=FUTBOL_RETRO",
      product: retroProduct,
    },
    {
      id: "essentials",
      eyebrow: "03 / FOOTBALL",
      title: "FOOTBALL ESSENTIALS",
      description: "Clubes y selecciones. La identidad del juego en cada camiseta.",
      cta: "VER TODO FÚTBOL",
      href: "/futbol",
      product: essentialsProduct,
    },
    {
      id: "training",
      eyebrow: "04 / PERFORMANCE",
      title: "TRAINING",
      description: "La extensión técnica de LR7 para entrenar con intención.",
      cta: "EXPLORAR TRAINING",
      href: "/training",
      product: trainingProduct,
    },
  ];

  useEffect(() => {
    const page = document.querySelector<HTMLElement>(".collections-page");
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-collections-reveal]"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    page?.classList.add("collections-motion-ready");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8%", threshold: 0.12 },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <main className="collections-page">
      <header className="collections-hero">
        <div className="collections-hero-media" aria-hidden="true">
          <Image
            src={CAMPAIGN_IMAGES.hero.src}
            alt=""
            fill
            loading="eager"
            fetchPriority="high"
            sizes="100vw"
          />
        </div>
        <div className="collections-hero-overlay" />
        <nav className="collections-breadcrumbs" aria-label="Migas de pan">
          <Link href="/">HOME</Link><span aria-hidden="true">/</span><span>NOVEDADES</span>
        </nav>
        <div className="collections-hero-copy">
          <p>LR7 / NEW ARRIVALS</p>
          <h1 className="font-display">NEW SEASON<br /><span>HAS ARRIVED.</span></h1>
          <div><span>CAMISETAS DE FÚTBOL</span><span>RETRO</span><span>TRAINING</span></div>
          <Link href="#new-arrivals" className="collections-primary-cta">
            EXPLORAR NOVEDADES <span aria-hidden="true">↓</span>
          </Link>
        </div>
        <div className="collections-hero-index" aria-hidden="true">
          <span>DROP</span><strong>01</strong><span>/ LR7</span>
        </div>
      </header>

      <nav className="collections-quick-nav" aria-label="Explorar novedades">
        <span>NOVEDADES</span>
        <Link href="/futbol">FÚTBOL</Link>
        <Link href="/tienda?cat=FUTBOL_RETRO">RETRO</Link>
        <Link href="/training">TRAINING</Link>
        <Link href="/tienda">TIENDA</Link>
      </nav>

      <section id="new-arrivals" className="collections-arrivals" aria-labelledby="collections-arrivals-title">
        <header className="collections-section-heading" data-collections-reveal>
          <div>
            <p>01 / CURATED NOW</p>
            <h2 id="collections-arrivals-title" className="font-display">NEW<br /><span>ARRIVALS.</span></h2>
          </div>
          <div>
            <p>Una selección de fútbol primero. Nuevas temporadas, ediciones con historia y una mirada técnica al entrenamiento.</p>
            <Link href="/tienda?cat=NUEVO">VER TODAS LAS NOVEDADES <span aria-hidden="true">→</span></Link>
          </div>
        </header>
        <div className="collections-arrivals-grid">
          {arrivals.map((product, index) => (
            <div key={product.id} data-collections-reveal style={{ "--reveal-delay": `${Math.min(index, 3) * 70}ms` } as React.CSSProperties}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      {newFootball.length ? (
        <section className="collections-drop" aria-labelledby="collections-drop-title">
          <div className="collections-drop-feature" data-collections-reveal>
            <Image src={CAMPAIGN_IMAGES.drop.src} alt={CAMPAIGN_IMAGES.drop.alt} fill sizes="(max-width: 900px) 100vw, 66vw" />
            <div className="collections-drop-overlay" />
            <div className="collections-drop-copy">
              <p>02 / THE NEW DROP</p>
              <h2 id="collections-drop-title" className="font-display">BUILT FOR<br /><span>THE GAME.</span></h2>
              <Link href={`/productos/${newFootball[0].slug}`}>COMPRAR AHORA <span aria-hidden="true">→</span></Link>
            </div>
          </div>
          <div className="collections-drop-products">
            {newFootball.slice(0, 3).map((product, index) => (
              <Link href={`/productos/${product.slug}`} key={product.id} className="collections-drop-product" data-collections-reveal>
                <div>
                  <Image src={product.images[0].src} alt={product.images[0].alt} fill sizes="(max-width: 900px) 50vw, 20vw" />
                  <span>NUEVO</span>
                </div>
                <p>{String(index + 1).padStart(2, "0")} / {product.team}</p>
                <h3 className="font-display">{product.name}</h3>
                <strong>${formatCurrency(product.price.amount)}</strong>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="collections-explore" aria-labelledby="collections-explore-title">
        <header className="collections-section-heading" data-collections-reveal>
          <div><p>03 / COLLECTIONS</p><h2 id="collections-explore-title" className="font-display">EXPLORE<br /><span>THE DROP.</span></h2></div>
          <div><p>Cuatro formas de entrar al universo LR7. El fútbol dirige; Training acompaña.</p></div>
        </header>
        <div className="collections-editorial-grid">
          {collections.map((collection) => (
            <Link key={collection.id} href={collection.href} className={`collections-editorial-card collections-editorial-${collection.id}`} data-collections-reveal>
              <Image src={collection.product.images[0].src} alt={collection.product.images[0].alt} fill sizes={collection.id === "season" ? "(max-width: 760px) 100vw, 66vw" : "(max-width: 760px) 100vw, 33vw"} />
              <div className="collections-editorial-overlay" />
              <div className="collections-editorial-content">
                <p>{collection.eyebrow}</p>
                <div><h3 className="font-display">{collection.title}</h3><span>{collection.description}</span></div>
                <b>{collection.cta} <i aria-hidden="true">→</i></b>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="collections-shop-close" data-collections-reveal>
        <p>DISCOVER. FEEL THE DROP. SHOP THE GAME.</p>
        <h2 className="font-display">READY FOR<br /><span>THE NEXT MATCH?</span></h2>
        <Link href="/tienda">IR A LA TIENDA <span aria-hidden="true">→</span></Link>
      </section>
    </main>
  );
}