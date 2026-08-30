"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export function NewsletterPremium() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section className={`newsletter-premium ${isVisible ? "is-visible" : ""}`} ref={sectionRef} aria-labelledby="newsletter-premium-title">
      <div className="newsletter-premium-bg">
        <Image
          src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1920&h=1080&fit=crop&auto=format"
          alt="Futbolista en acción"
          fill
          priority={false}
          sizes="100vw"
          style={{ objectFit: "cover" }}
        />
      </div>
      <div className="newsletter-premium-overlay" />
      <div className="newsletter-premium-inner">
        <div className="newsletter-premium-left">
          <p className="font-display newsletter-premium-label">LR7 / MEMBERSHIP</p>
          <div className="newsletter-premium-number" aria-hidden="true">
            <span>10</span>
            <span>%</span>
          </div>
        </div>
        <div className="newsletter-premium-right">
          <h2 id="newsletter-premium-title" className="font-display newsletter-premium-title">
            EN TU<br />PRIMERA<br />COMPRA.
          </h2>
          <p className="newsletter-premium-copy">
            Accede a lanzamientos LR7 y recibe el beneficio cuando activemos la membresía.
          </p>
          <output className="newsletter-premium-terms">Registro próximamente. No estamos recolectando correos todavía.</output>
        </div>
      </div>
    </section>
  );
}
