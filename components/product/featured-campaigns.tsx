"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { formatCurrency } from "@/lib/products";
import type { Product } from "@/types/ecommerce";

type FeaturedCampaignsProps = Readonly<{
  footballProduct: Product;
  trainingProduct: Product;
  newDropProduct: Product;
}>;

type CampaignProps = Readonly<{
  product: Product;
  eyebrow: string;
  title: ReactNode;
  description: string;
  cta: string;
  href: string;
  variant: "football" | "training" | "drop";
}>;

function Campaign({ product, eyebrow, title, description, cta, href, variant }: CampaignProps) {
  return (
    <Link className={`featured-campaign featured-campaign-${variant}`} href={href}>
      <div className="featured-campaign-image">
        <Image src={product.images[0].src} alt={product.images[0].alt} fill sizes="(max-width: 700px) 100vw, 60vw" />
      </div>
      <div className="featured-campaign-overlay" />
      <div className="featured-campaign-content">
        <p className="font-display featured-campaign-eyebrow">{eyebrow}</p>
        <div>
          <h2 className="font-display featured-campaign-title">{title}</h2>
          <p className="featured-campaign-description">{description}</p>
          <span className="featured-campaign-product">{product.name} <strong>${formatCurrency(product.price.amount)}</strong></span>
          <span className="featured-campaign-cta">{cta} <b aria-hidden="true">→</b></span>
        </div>
      </div>
    </Link>
  );
}

export function FeaturedCampaigns({ footballProduct, trainingProduct, newDropProduct }: FeaturedCampaignsProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          section.classList.add("is-visible");
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="featured-campaigns" ref={sectionRef} aria-labelledby="featured-campaigns-title">
      <div className="featured-campaigns-heading">
        <div>
          <p className="font-display featured-campaigns-label">LR7 / SELECCIÓN</p>
          <h2 id="featured-campaigns-title" className="font-display featured-campaigns-title">CAMPAÑAS<br />PARA JUGAR.</h2>
        </div>
        <p className="featured-campaigns-intro">Piezas elegidas para llevar el juego contigo.</p>
      </div>
      <div className="featured-campaigns-grid">
        <Campaign
          product={footballProduct}
          eyebrow="FOOTBALL / 01"
          title={<>JERSEYS THAT<br /><span>FEEL LIKE THE GAME.</span></>}
          description="El fútbol es el corazón de LR7."
          cta="VER CAMISETAS"
          href="/futbol"
          variant="football"
        />
        <Campaign
          product={trainingProduct}
          eyebrow="TRAINING / 02"
          title={<>BUILT TO<br /><span>MOVE.</span></>}
          description="Preparado para cada sesión."
          cta="VER TRAINING"
          href="/training"
          variant="training"
        />
        <Campaign
          product={newDropProduct}
          eyebrow="NEW DROP / 03"
          title={<>07<br /><span>LIMITED.</span></>}
          description="Una pieza para los que llegan primero."
          cta="DESCUBRIR"
          href={`/productos/${newDropProduct.slug}`}
          variant="drop"
        />
      </div>
    </section>
  );
}
