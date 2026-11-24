"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FavoriteButton } from "@/components/product/favorite-button";
import { useStore } from "@/components/providers/store-provider";
import { formatCurrency, getBadgeDisplayName } from "@/lib/products";
import type { Product } from "@/types/ecommerce";

type StreetwearPageProps = Readonly<{
  products: Product[];
}>;

const STREET_IMAGES = {
  hero: {
    src: "https://images.unsplash.com/photo-1781863074773-836134430654?w=1800&h=1200&fit=crop&auto=format",
    alt: "Hombre con camiseta de fútbol roja y gafas de sol en un look urbano",
  },
  culture: {
    src: "https://images.unsplash.com/photo-1760126119562-4972951eb6bc?w=1400&h=1600&fit=crop&auto=format",
    alt: "Mujer con jersey azul y blanco, joyería y un look urbano",
  },
  looks: [
    {
      src: "https://images.unsplash.com/photo-1783434423799-428517511fb7?w=1000&h=1300&fit=crop&auto=format",
      alt: "Hombre con camiseta amarilla en un look de cultura futbolera",
    },
    {
      src: "https://images.unsplash.com/photo-1738585478152-6a774564f5b8?w=1000&h=1300&fit=crop&auto=format",
      alt: "Hombre con camiseta roja y negra y skateboard en un look streetwear",
    },
    {
      src: "https://images.unsplash.com/photo-1760126119413-16c129b56981?w=1000&h=1300&fit=crop&auto=format",
      alt: "Mujer con jersey azul y blanco, joyería y gafas junto a un automóvil",
    },
  ],
} as const;

const QUICK_CATEGORIES = [
  { number: "01", label: "FIT OVERSIZE", href: "#street-products" },
  { number: "02", label: "RETRO", href: "/tienda?cat=FUTBOL_RETRO" },
  { number: "03", label: "SELECCIONES", href: "/tienda?cat=FUTBOL_SELECCIONES" },
  { number: "04", label: "CLUBES", href: "/tienda?cat=FUTBOL_CLUBES" },
  { number: "05", label: "NOVEDADES", href: "/colecciones" },
  { number: "06", label: "VER TODO", href: "/tienda" },
] as const;

const LOOKS = [
  { number: "LOOK 01 / DÍA LIBRE", title: "OVERSIZE + BAGGY", detail: "Proporciones relajadas, denim ancho y sneakers limpios." },
  { number: "LOOK 02 / DE NOCHE", title: "JERSEY + CARGO", detail: "Una camiseta protagonista para salir cuando cae la noche." },
  { number: "LOOK 03 / TODOS LOS DÍAS", title: "JERSEY + ACCESORIOS", detail: "Joyería, gafas y actitud para convertir la camiseta en el centro del look." },
] as const;

function StreetProduct({ product, index }: Readonly<{ product: Product; index: number }>) {
  const [selectedSize, setSelectedSize] = useState("");
  const [added, setAdded] = useState(false);
  const { addToCart } = useStore();
  const variants = product.variants.filter(
    (variant, variantIndex, allVariants) =>
      allVariants.findIndex((candidate) => candidate.size === variant.size) === variantIndex,
  );
  const selectedVariant = variants.find((variant) => variant.size === selectedSize);
  const purchaseLabel = added ? "AGREGADO" : selectedVariant ? "AGREGAR" : "ELIGE TALLA";

  useEffect(() => {
    if (!added) return;
    const timeout = window.setTimeout(() => setAdded(false), 1800);
    return () => window.clearTimeout(timeout);
  }, [added]);

  const handleAdd = () => {
    if (!selectedVariant) return;
    addToCart({
      product,
      variant: selectedVariant,
      size: selectedVariant.size,
      customName: "",
      customNumber: "",
      unitPrice: product.price.amount,
      quantity: 1,
    }, { notify: true });
    setAdded(true);
  };

  return (
    <article className={`street-product street-product-${index + 1}`}>
      <div className="street-product-media">
        <Link href={`/productos/${product.slug}`} aria-label={`Ver ${product.name}`}>
          <Image
            src={product.images[0].src}
            alt={product.images[0].alt}
            fill
            sizes={index === 0 ? "(max-width: 760px) 88vw, 52vw" : "(max-width: 760px) 74vw, 28vw"}
          />
          <Image
            className="street-product-hover"
            src={product.hoverImage.src}
            alt=""
            fill
            sizes={index === 0 ? "(max-width: 760px) 88vw, 52vw" : "(max-width: 760px) 74vw, 28vw"}
          />
        </Link>
        <span className="street-product-index">0{index + 1}</span>
        {product.badge ? <span className="street-product-badge">{getBadgeDisplayName(product.badge)}</span> : null}
        <FavoriteButton productId={product.id} />
      </div>
      <div className="street-product-info">
        <div><span>{product.team}</span><span>FIT OVERSIZE</span></div>
        <h3 className="font-display"><Link href={`/productos/${product.slug}`}>{product.name}</Link></h3>
        <p>${formatCurrency(product.price.amount)}</p>
        <fieldset className="street-product-sizes">
          <legend>ELIGE TU FIT</legend>
          <div>
            {variants.map((variant) => (
              <button
                type="button"
                key={variant.size}
                className={selectedSize === variant.size ? "is-selected" : ""}
                onClick={() => { setSelectedSize(variant.size); setAdded(false); }}
                aria-pressed={selectedSize === variant.size}
                aria-label={`Talla ${variant.size}`}
              >
                {variant.size}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="street-product-purchase">
          <button type="button" onClick={handleAdd} disabled={!selectedVariant}>
            {purchaseLabel}
          </button>
          <Link href={`/productos/${product.slug}`} className="street-product-link">VER PIEZA</Link>
        </div>
        <span className="street-product-status" aria-live="polite">{added ? `${product.name}, talla ${selectedSize}, agregado al carrito.` : ""}</span>
      </div>
    </article>
  );
}

export function StreetwearExperience({ products }: StreetwearPageProps) {
  const footballProducts = products.filter((product) => product.brand === "FUTBOL");
  const featured = footballProducts.slice(0, 4);
  const drops = [...footballProducts]
    .sort((first, second) => Number(second.badge === "NUEVO") - Number(first.badge === "NUEVO"))
    .slice(0, 3);

  useEffect(() => {
    document.body.classList.add("streetwear-route");
    return () => document.body.classList.remove("streetwear-route");
  }, []);

  // UX8: sin aparición por secciones ni cinta en movimiento (DESIGN.md, sección Motion: prohibidas). El contenido está
  // visible desde el principio, así que tampoco quedan huecos en blanco al bajar rápido.

  return (
    <div className="street-page">
      <header className="street-hero">
        <Image src={STREET_IMAGES.hero.src} alt={STREET_IMAGES.hero.alt} fill priority sizes="100vw" />
        <div className="street-hero-shade" />
        <div className="street-hero-stamp" aria-hidden="true"><span>LR7</span><strong>EDICIÓN<br />DE ESTILO<br />01 / 26</strong></div>
        <div className="street-hero-copy">
          <p>LR7 / STREETWEAR INSPIRADO EN EL FÚTBOL / BOGOTÁ</p>
          <h1 className="font-display">EL FÚTBOL<br /><span>SE VISTE.</span></h1>
          <div className="street-hero-bottom">
            <p>Camisetas inspiradas en el juego, pensadas para construir el look. Fuera de la cancha, dentro de tu estilo.</p>
            <Link href="#street-looks">VER CÓMO LLEVARLA</Link>
          </div>
        </div>
        <p className="street-hero-side" aria-hidden="true">FÚTBOL / MODA / TU ESTILO · EDITORIAL LR7 01</p>
      </header>

      <nav className="street-chapters" aria-label="Capítulos de la campaña">
        <Link href="#street-culture"><span>01</span><strong>LA IDEA</strong><small>La inspiración</small></Link>
        <Link href="#street-products"><span>02</span><strong>LAS PIEZAS</strong><small>Las oversize</small></Link>
        <Link href="#street-looks"><span>03</span><strong>CÓMO LLEVARLA</strong><small>Arma el look</small></Link>
        <Link href="#street-drops"><span>04</span><strong>NOVEDADES</strong><small>Lo más nuevo</small></Link>
      </nav>

      <div className="street-manifesto-tape" aria-hidden="true">
        <div aria-hidden="true">
          <span>EL FÚTBOL SE VISTE</span><i>✦</i><span>FIT OVERSIZE</span><i>✦</i><span>HECHA PARA EL OUTFIT</span><i>✦</i><span>LLEVA EL JUEGO</span><i>✦</i>
        </div>
      </div>

      <section id="street-culture" className="street-culture" aria-labelledby="street-culture-title">
        <div className="street-culture-image">
          <Image src={STREET_IMAGES.culture.src} alt={STREET_IMAGES.culture.alt} fill sizes="(max-width: 800px) 100vw, 50vw" />
          <span aria-hidden="true">NOTA DE ESTILO / 01</span>
        </div>
        <div className="street-culture-copy">
          <p>01 / LA IDEA</p>
          <h2 id="street-culture-title" className="font-display">DEL JUEGO<br /><span>AL LOOK.</span></h2>
          <blockquote>“Nos inspiran sus colores, sus números y su historia. Tú decides cómo llevarlos.”</blockquote>
          <div className="street-culture-code" aria-label="Código de estilo LR7">
            <span>01 / OVERSIZE</span><span>02 / BAGGY</span><span>03 / SNEAKERS</span><span>04 / ACCESORIOS</span>
          </div>
          <p>El fútbol es la referencia, no el uniforme. Reinterpretamos la camiseta como una pieza de moda para combinar con denim, cargos, shorts y tus sneakers favoritos.</p>
          <Link href="#street-products">DESCUBRIR LAS PIEZAS</Link>
        </div>
      </section>

      <nav className="street-category-rail" aria-label="Categorías streetwear">
        {QUICK_CATEGORIES.map((category) => (
          <Link href={category.href} key={category.label}>
            <span>{category.number}</span><strong>{category.label}</strong>
          </Link>
        ))}
      </nav>

      <section id="street-products" className="street-products" aria-labelledby="street-products-title">
        <header className="street-section-header">
          <div><span>02 / LAS PIEZAS</span><p>Siluetas amplias. Referencias futboleras.<br />Diseñadas para vestir y combinar.</p></div>
          <h2 id="street-products-title" className="font-display">FÚTBOL PARA<br /><em>VESTIR.</em></h2>
        </header>
        <div className="street-products-grid">
          {featured.map((product, index) => <StreetProduct key={product.id} product={product} index={index} />)}
        </div>
      </section>

      <section id="street-looks" className="street-looks" aria-labelledby="street-looks-title">
        <header>
          <p>03 / CÓMO LLEVARLA</p>
          <h2 id="street-looks-title" className="font-display">UNA CAMISETA.<br /><span>TODO EL OUTFIT.</span></h2>
        </header>
        <div className="street-look-grid" role="region" aria-label="Looks de streetwear" tabIndex={0}>
          {LOOKS.map((look, index) => (
            <article key={look.number} className="street-look">
              <div><Image src={STREET_IMAGES.looks[index].src} alt={STREET_IMAGES.looks[index].alt} fill sizes="(max-width: 700px) 84vw, 33vw" /></div>
              <span>{look.number}</span><h3 className="font-display">{look.title}</h3><p>{look.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="street-drops" className="street-drops" aria-labelledby="street-drops-title">
        <header><p>04 / NOVEDADES</p><h2 id="street-drops-title" className="font-display">NUEVAS <span>PIEZAS.</span></h2><Link href="/colecciones">VER NOVEDADES</Link></header>
        <div className="street-drop-list">
          {drops.map((product, index) => (
            <Link href={`/productos/${product.slug}`} key={product.id}>
              <span>NUEVO / {String(index + 1).padStart(2, "0")}</span>
              <div><Image src={product.images[0].src} alt="" fill sizes="96px" /></div>
              <h3 className="font-display">{product.name}</h3>
              <p>{product.team}</p><strong>${formatCurrency(product.price.amount)}</strong>
            </Link>
          ))}
        </div>
      </section>

      <section className="street-final">
        <p>NO NECESITAS ESTAR JUGANDO PARA VESTIR FÚTBOL.</p>
        <h2 className="font-display">TU PASIÓN.<br /><span>TU ESTILO.</span></h2>
        <Link href="/tienda?brand=FUTBOL">COMPRAR LA COLECCIÓN</Link>
      </section>
    </div>
  );
}