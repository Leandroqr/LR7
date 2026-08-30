"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Product } from "@/types/ecommerce";
import { ProductCard } from "@/components/product/product-card";

type FeaturedCarouselProps = {
  products: Product[];
  label: string;
  title: string;
  href: string;
  cta: string;
};

export function FeaturedCarousel({ products, label, title, href, cta }: Readonly<FeaturedCarouselProps>) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [visibleSlides, setVisibleSlides] = useState(3);

  useEffect(() => {
    const updateVisibleSlides = () => {
      let preferredSlides = 3.2;
      if (window.innerWidth <= 600) preferredSlides = 1.12;
      else if (window.innerWidth <= 1000) preferredSlides = 2.15;

      const nextVisibleSlides = Math.min(preferredSlides, products.length);
      setVisibleSlides(nextVisibleSlides);
      setActiveIndex((index) => Math.min(index, Math.max(0, Math.floor(products.length - nextVisibleSlides))));
    };

    updateVisibleSlides();
    window.addEventListener("resize", updateVisibleSlides);
    return () => window.removeEventListener("resize", updateVisibleSlides);
  }, [products.length]);

  const slideCount = Math.max(1, Math.floor(products.length - visibleSlides) + 1);

  useEffect(() => {
    if (isPaused || products.length < 2) return;

    const interval = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % slideCount);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [isPaused, products.length, slideCount]);

  const move = (direction: number) => {
    setActiveIndex((index) => (index + direction + slideCount) % slideCount);
  };

  if (products.length === 0) return null;

  return (
    <section className="featured-carousel" aria-roledescription="carrusel" aria-label={title}>
      <div className="featured-carousel-inner">
        <div className="featured-carousel-heading">
          <div>
            <p className="font-display featured-carousel-label">{label}</p>
            <h2 className="font-display featured-carousel-title">{title}</h2>
          </div>
          <div className="featured-carousel-controls">
            <span className="featured-carousel-count" aria-live="polite">
              <strong>{String(activeIndex + 1).padStart(2, "0")}</strong> / {String(slideCount).padStart(2, "0")}
            </span>
            <button type="button" className="carousel-arrow" onClick={() => move(-1)} aria-label="Producto anterior">
              <span aria-hidden="true">←</span>
            </button>
            <button type="button" className="carousel-arrow" onClick={() => move(1)} aria-label="Siguiente producto">
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>

        <div
          className="featured-carousel-viewport"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
        >
          <ol className="featured-carousel-track" style={{ transform: `translateX(-${activeIndex * (100 / visibleSlides)}%)` }}>
            {products.map((product, index) => (
              <li className="featured-carousel-slide" key={product.id} style={{ flex: `0 0 ${100 / visibleSlides}%` }} aria-label={`${index + 1} de ${products.length}`}>
                <div className="featured-carousel-slide-number">0{index + 1}</div>
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
          <Link href={href} className="btn-outline">{cta} <span aria-hidden="true">→</span></Link>
        </div>
      </div>
    </section>
  );
}
