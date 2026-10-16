"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Product } from "@/types/ecommerce";

type HighlightsCarouselProps = Readonly<{
  products: Product[];
}>;

type HighlightSlide = {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
  ctaText: string;
  href: string;
  product: Product;
  index: number;
};

export function HighlightsCarousel({ products }: HighlightsCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  
  // Parallax per layer
  const [parallaxBg, setParallaxBg] = useState({ x: 0, y: 0 });
  const [parallaxNumber, setParallaxNumber] = useState({ x: 0, y: 0 });
  const [parallaxText, setParallaxText] = useState({ x: 0, y: 0 });

  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);
  const dragRefRef = useRef({ isDragging: false, startX: 0, startTime: 0, velocity: 0 });

  const slides: HighlightSlide[] = [
    {
      id: "football",
      eyebrow: "LR7 / 01",
      title: "FOOTBALL",
      subtitle: "THE GAME STARTS HERE.",
      cta: "EXPLORE FOOTBALL",
      ctaText: "EXPLORE",
      href: "/futbol",
      product: products.find((p) => p.brand === "FUTBOL") ?? products[0],
      index: 1,
    },
    {
      id: "new-drop",
      eyebrow: "LR7 / 02",
      title: "NEW DROP",
      subtitle: "NEW SEASON. NEW ENERGY.",
      cta: "SHOP NEW DROP",
      ctaText: "DISCOVER",
      href: "/colecciones",
      product: products.find((p) => p.badge === "NUEVO") ?? products[1] ?? products[0],
      index: 2,
    },
    {
      id: "training",
      eyebrow: "LR7 / 03",
      title: "TRAINING",
      subtitle: "BUILT TO MOVE.",
      cta: "EXPLORE TRAINING",
      ctaText: "EXPLORE",
      href: "/training",
      product: products.find((p) => p.brand === "TRAINING") ?? products[2] ?? products[0],
      index: 3,
    },
    {
      id: "retro",
      eyebrow: "LR7 / 04",
      title: "RETRO",
      subtitle: "THE GAME NEVER FORGETS.",
      cta: "DISCOVER",
      ctaText: "BROWSE",
      href: `/productos/${products[3]?.slug ?? products[0].slug}`,
      product: products[3] ?? products[0],
      index: 4,
    },
  ];

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

  useEffect(() => {
    if (isPaused || !isVisible || isDragging) return;

    if (autoplayRef.current) clearTimeout(autoplayRef.current);
    autoplayRef.current = setTimeout(() => {
      setActiveIndex((i) => (i + 1) % slides.length);
    }, 6500);

    return () => {
      if (autoplayRef.current) clearTimeout(autoplayRef.current);
    };
  }, [isPaused, isVisible, isDragging, activeIndex, slides.length]);

  // Parallax on mouse move over viewport
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!viewportRef.current || isDragging) return;
    
    const rect = viewportRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

    setParallaxBg({ x: x * 2, y: y * 2 });
    setParallaxNumber({ x: x * 3, y: y * 3 });
    setParallaxText({ x: x * 2, y: y * 2 });
  };

  const handleMouseLeave = () => {
    setParallaxBg({ x: 0, y: 0 });
    setParallaxNumber({ x: 0, y: 0 });
    setParallaxText({ x: 0, y: 0 });
    setIsPaused(false);
  };

  // Drag/Swipe handling
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragStart(e.clientX);
    dragRefRef.current = {
      isDragging: true,
      startX: e.clientX,
      startTime: Date.now(),
      velocity: 0,
    };
  };

  const handlePointerMove = () => {
    if (!isDragging) return;
    // Drag is tracked via dragStart position
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);

    const diff = dragStart - e.clientX;
    const timeDelta = Date.now() - dragRefRef.current.startTime;
    const velocity = diff / timeDelta;

    // Threshold for snap
    if (Math.abs(diff) > 50 || Math.abs(velocity) > 0.5) {
      if (diff > 0) {
        setActiveIndex((i) => (i + 1) % slides.length);
      } else {
        setActiveIndex((i) => (i - 1 + slides.length) % slides.length);
      }
      setIsPaused(true);
    }

    setDragStart(0);
  };

  const handlePrev = () => {
    setActiveIndex((i) => (i - 1 + slides.length) % slides.length);
    setIsPaused(true);
  };

  const handleNext = () => {
    setActiveIndex((i) => (i + 1) % slides.length);
    setIsPaused(true);
  };

  return (
    <section className={`highlights-carousel ${isVisible ? "is-visible" : ""}`} ref={sectionRef} aria-label="Premium Football Highlights Swiper">
      <div className="highlights-carousel-header">
        <div className="highlights-carousel-heading">
          <p className="font-display highlights-carousel-label">LR7 / HIGHLIGHTS</p>
          <h2 className="font-display highlights-carousel-title">
            CAMPAIGN<br />
            <span>MOMENTS.</span>
          </h2>
        </div>
      </div>

      <div
        className="highlights-carousel-viewport"
        ref={viewportRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={handleMouseLeave}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      >
        <div
          className="highlights-carousel-track"
          ref={trackRef}
          style={{
            transform: `translateX(calc(-${activeIndex} * (82% + 1.25rem)))`,
            transition: isDragging ? "none" : "transform 800ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {slides.map((slide, idx) => {
            const isActive = idx === activeIndex;
            const isNext = idx === (activeIndex + 1) % slides.length;
            const isPrev = idx === (activeIndex - 1 + slides.length) % slides.length;
            const shouldRender = isActive || isNext || isPrev;

            return (
              <article
                key={slide.id}
                className={`highlights-swiper-card ${isActive ? "is-active" : ""}`}
                aria-roledescription="slide"
              >
                <div className="highlights-swiper-card-inner">
                  {shouldRender && (
                    <>
                      {/* Background Image Layer */}
                      <div
                        className="highlights-swiper-card-bg"
                        style={{
                          transform: isActive
                            ? `translate(${parallaxBg.x}px, ${parallaxBg.y}px) scale(1.05)`
                            : `translate(${parallaxBg.x * 0.3}px, ${parallaxBg.y * 0.3}px) scale(1)`,
                          transition: isDragging ? "none" : "transform 200ms ease-out",
                        }}
                      >
                        <Image
                          src={slide.product.images[0].src}
                          alt={slide.product.images[0].alt}
                          fill
                          fetchPriority={isActive ? "high" : "auto"}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 85vw"
                          style={{ objectFit: "cover" }}
                        />
                      </div>

                      {/* Overlay Gradient */}
                      <div className="highlights-swiper-card-overlay" />

                      {/* Large Number */}
                      <div
                        className="highlights-swiper-card-number"
                        style={{
                          transform: isActive
                            ? `translate(${parallaxNumber.x}px, ${parallaxNumber.y}px) scale(1)`
                            : `translate(${parallaxNumber.x * 0.2}px, ${parallaxNumber.y * 0.2}px) scale(0.95)`,
                          opacity: isActive ? 0.15 : 0.08,
                          transition: isDragging ? "none" : "transform 200ms ease-out, opacity 300ms ease",
                        }}
                        aria-hidden="true"
                      >
                        0{slide.index}
                      </div>

                      {/* Content */}
                      <div
                        className="highlights-swiper-card-content"
                        style={{
                          transform: isActive
                            ? `translate(${parallaxText.x}px, ${parallaxText.y}px) translateY(0)`
                            : `translate(${parallaxText.x * 0.2}px, ${parallaxText.y * 0.2}px) translateY(20px)`,
                          opacity: isActive ? 1 : 0.7,
                          transition: isDragging ? "none" : "all 300ms ease-out",
                        }}
                      >
                        <p className="font-display highlights-swiper-card-eyebrow">{slide.eyebrow}</p>
                        <h3 className="font-display highlights-swiper-card-title">{slide.title}</h3>
                        <p className="highlights-swiper-card-subtitle">{slide.subtitle}</p>

                        <Link href={slide.href} className="highlights-swiper-card-cta">
                          <span>{slide.ctaText}</span>
                          <span aria-hidden="true">→</span>
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Navigation & Progress */}
      <div className="highlights-carousel-footer">
        <div className="highlights-carousel-progress">
          <span className="highlights-carousel-counter">
            <strong>0{activeIndex + 1}</strong> <span>/</span> <span>0{slides.length}</span>
          </span>
          <div className="highlights-carousel-progress-bar">
            <div className="highlights-carousel-progress-track">
              <div
                className="highlights-carousel-progress-fill"
                style={{
                  width: isPaused ? "0%" : "100%",
                  animation: isPaused ? "none" : `highlights-progress 6500ms linear forwards`,
                  animationIterationCount: "1",
                }}
              />
            </div>
          </div>
        </div>
        <div className="highlights-carousel-controls">
          <button type="button" className="highlights-carousel-btn-prev" onClick={handlePrev} aria-label="Slide anterior">
            ← PREV
          </button>
          <button type="button" className="highlights-carousel-btn-next" onClick={handleNext} aria-label="Siguiente slide">
            NEXT →
          </button>
        </div>
      </div>
    </section>
  );
}
