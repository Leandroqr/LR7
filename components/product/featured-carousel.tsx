"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Product } from "@/types/ecommerce";
import { ProductCard } from "@/components/product/product-card";

// Sin autoavance: el visitante decide cuándo pasar (UX4; WCAG 2.2.2 y "un momento por página").
const ARROW_LEFT = <svg className="carousel-arrow-glyph" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M15 5 8 12l7 7" /></svg>;
const ARROW_RIGHT = <svg className="carousel-arrow-glyph" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m9 5 7 7-7 7" /></svg>;

type FeaturedCarouselProps = {
  products: Product[];
  /** Etiqueta opcional sobre el título; por defecto no se muestra (DESIGN.md → The Titular Solo Rule). */
  label?: string;
  title: string;
  href: string;
  cta: string;
};

export function FeaturedCarousel({ products, label, title, href, cta }: Readonly<FeaturedCarouselProps>) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleSlides, setVisibleSlides] = useState(4);

  useEffect(() => {
    const updateVisibleSlides = () => {
      // Se asoma la tarjeta siguiente para indicar que hay más (misma escala que la rejilla de la tienda).
      let preferredSlides = 4;
      if (window.innerWidth <= 600) preferredSlides = 1.6;
      else if (window.innerWidth <= 1000) preferredSlides = 2.6;

      const nextVisibleSlides = Math.min(preferredSlides, products.length);
      setVisibleSlides(nextVisibleSlides);
      setActiveIndex((index) => Math.min(index, Math.max(0, Math.floor(products.length - nextVisibleSlides))));
    };

    updateVisibleSlides();
    window.addEventListener("resize", updateVisibleSlides);
    return () => window.removeEventListener("resize", updateVisibleSlides);
  }, [products.length]);

  const slideCount = Math.max(1, Math.floor(products.length - visibleSlides) + 1);

  const move = (direction: number) => {
    setActiveIndex((index) => (index + direction + slideCount) % slideCount);
  };

  if (products.length === 0) return null;

  return (
    <section className="featured-carousel" aria-roledescription="carrusel" aria-label={title}>
      <div className="featured-carousel-inner">
        <div className="featured-carousel-heading">
          <div>
            {label ? <p className="font-display featured-carousel-label">{label}</p> : null}
            <h2 className="font-display featured-carousel-title">{title}</h2>
          </div>
          <div className="featured-carousel-controls">
            <span className="featured-carousel-count" aria-live="polite">
              <strong>{String(activeIndex + 1).padStart(2, "0")}</strong> / {String(slideCount).padStart(2, "0")}
            </span>
            <button type="button" className="carousel-arrow" onClick={() => move(-1)} aria-label="Producto anterior">
              {ARROW_LEFT}
            </button>
            <button type="button" className="carousel-arrow" onClick={() => move(1)} aria-label="Siguiente producto">
              {ARROW_RIGHT}
            </button>
          </div>
        </div>

        <div className="featured-carousel-viewport">
          <ol className="featured-carousel-track" style={{ transform: `translateX(-${activeIndex * (100 / visibleSlides)}%)` }}>
            {products.map((product, index) => (
              <li className="featured-carousel-slide" key={product.id} style={{ flex: `0 0 ${100 / visibleSlides}%` }} aria-label={`${index + 1} de ${products.length}`}>
                <ProductCard product={product} />
              </li>
            ))}
          </ol>
        </div>

        <div className="featured-carousel-footer">
          <div className="featured-carousel-dots" role="tablist" aria-label="Seleccionar producto destacado">
            {products.slice(0, slideCount).map((product, index) => (
              <button
                type="button"
                key={product.id}
                className={`carousel-dot ${activeIndex === index ? "active" : ""}`}
                onClick={() => setActiveIndex(index)}
                role="tab"
                aria-selected={activeIndex === index}
                aria-label={`Ver ${product.name}`}
              />
            ))}
          </div>
          <Link href={href} className="btn-outline">{cta}</Link>
        </div>
      </div>
    </section>
  );
}
