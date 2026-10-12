"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/products";
import type { Product } from "@/types/ecommerce";
import type { Database } from "@/types/database";

type HeroSlide = {
  id: string;
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
  cta: string;
  href: string;
  image: string;
  alt: string;
};

function buildSlides(products: Product[]): HeroSlide[] {
  const newFootball = products.find((product) => product.brand === "FUTBOL" && product.badge === "NUEVO");
  const retro = products.find((product) => product.category === "FUTBOL_RETRO");
  const personalizable = products.find((product) => product.brand === "FUTBOL" && product.personalizable);
  const training = products.find((product) => product.brand === "TRAINING");

  return [
    newFootball && {
      id: "new-season",
      eyebrow: "NUEVA TEMPORADA / 01",
      title: "NUEVO EN",
      accent: "LA CANCHA.",
      description: `${newFootball.name} · $${formatCurrency(newFootball.price.amount)}`,
      cta: "VER PRODUCTO",
      href: `/productos/${newFootball.slug}`,
      image: newFootball.images[0].src,
      alt: newFootball.images[0].alt,
    },
    retro && {
      id: "retro",
      eyebrow: "RETRO / 02",
      title: "HISTORIA QUE",
      accent: "SE VISTE.",
      description: `${retro.name} · $${formatCurrency(retro.price.amount)}`,
      cta: "VER CAMISETAS RETRO",
      href: "/categorias/futbol-retro",
      image: retro.images[0].src,
      alt: retro.images[0].alt,
    },
    personalizable && {
      id: "personaliza",
      eyebrow: "PERSONALIZA / 03",
      title: "TU NOMBRE.",
      accent: "TU NÚMERO.",
      description: "Personaliza camisetas seleccionadas antes de agregarlas al carrito.",
      cta: "PERSONALIZAR",
      href: "/personaliza",
      image: personalizable.images[0].src,
      alt: personalizable.images[0].alt,
    },
    training && {
      id: "training",
      eyebrow: "TRAINING / 04",
      title: "ENTRENA PARA",
      accent: "EL JUEGO.",
      description: `${training.name} · $${formatCurrency(training.price.amount)}`,
      cta: "VER TRAINING",
      href: "/training",
      image: training.images[0].src,
      alt: training.images[0].alt,
    },
  ].filter((slide): slide is HeroSlide => Boolean(slide));
}

export function HeroCarousel({ products, homeSlides }: Readonly<{ products: Product[]; homeSlides?: Database["public"]["Tables"]["home_slides"]["Row"][] }>) {
  const slides = homeSlides?.length ? homeSlides.map((slide) => ({ id: slide.id, eyebrow: slide.eyebrow, title: slide.title, accent: slide.accent_text ?? "", description: slide.subtitle ?? "", cta: slide.cta_label, href: slide.cta_href, image: slide.image_path, alt: slide.title })) : buildSlides(products);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const activeSlide = slides[activeIndex];

  useEffect(() => {
    if (isPaused) return;

    const interval = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % slides.length);
    }, 6000);

    return () => window.clearInterval(interval);
  }, [isPaused, slides.length]);

  const move = (direction: number) => {
    setActiveIndex((index) => (index + direction + slides.length) % slides.length);
    setIsPaused(true);
    window.setTimeout(() => setIsPaused(false), 6000);
  };

  if (!activeSlide) return null;

  return (
    <section
      className="hero-carousel"
      role="application"
      aria-roledescription="carrusel"
      aria-label="Campaña LR7"
    >
      <div className="hero-carousel-slides" aria-live="polite">
        {slides.map((slide, index) => (
          <article className={`hero-carousel-slide ${index === activeIndex ? "is-active" : ""}`} key={slide.id} aria-hidden={index !== activeIndex} inert={index !== activeIndex}>
            <div className="hero-carousel-media">
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                priority={index === 0}
                loading={index === 0 ? "eager" : "lazy"}
                sizes="100vw"
                style={{ objectFit: "cover" }}
              />
            </div>
            <div className="hero-carousel-overlay" />
            <div className="hero-carousel-content">
              <p className="font-display hero-carousel-eyebrow">{slide.eyebrow}</p>
              {index === 0 ? (
                <h1 className="font-display hero-carousel-title">
                  {slide.title}<br /><span>{slide.accent}</span>
                </h1>
              ) : (
                <h2 className="font-display hero-carousel-title">
                  {slide.title}<br /><span>{slide.accent}</span>
                </h2>
              )}
              <p className="hero-carousel-description">{slide.description}</p>
              <Link href={slide.href} className="btn-primary hero-carousel-cta">{slide.cta} <span aria-hidden="true">→</span></Link>
            </div>
            <span className="hero-carousel-number" aria-hidden="true">0{index + 1}</span>
          </article>
        ))}
      </div>

      <div className="hero-carousel-footer">
        <div className="hero-carousel-progress" aria-hidden="true">
          <span className="hero-carousel-progress-fill" key={activeIndex} style={{ animationPlayState: isPaused ? "paused" : "running" }} />
        </div>
        <div className="hero-carousel-navigation">
          <span className="hero-carousel-count" aria-live="polite"><strong>0{activeIndex + 1}</strong> / 0{slides.length}</span>
          <button type="button" className="hero-carousel-arrow" onClick={() => move(-1)} onKeyDown={(event) => event.key === "ArrowLeft" && move(-1)} aria-label="Slide anterior">←</button>
          <button type="button" className="hero-carousel-arrow" onClick={() => move(1)} onKeyDown={(event) => event.key === "ArrowRight" && move(1)} aria-label="Siguiente slide">→</button>
        </div>
      </div>
    </section>
  );
}
