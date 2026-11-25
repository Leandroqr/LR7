"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type CSSProperties } from "react";
import { formatCurrency } from "@/lib/products";
import { isPublicHrefEnabled } from "@/lib/store-scope";
import type { Product } from "@/types/ecommerce";
import type { Database } from "@/types/database";

type CmsSlide = Database["public"]["Tables"]["home_slides"]["Row"];

type HeroSlide = Readonly<{
  id: string;
  lines: string[];
  subtitle: string;
  cta: { label: string; href: string };
  image: string;
  position?: string;
}>;

// Foto de ambiente con licencia de Unsplash: estadio de noche, aficionado de espaldas con nombre y
// número, sin logos ni escudos visibles.
export const HERO_PHOTO_ID = "photo-1516948900-c5137d2bf399";
const DEFAULT_IMAGE = `https://images.unsplash.com/${HERO_PHOTO_ID}?w=2400&auto=format&fit=crop&q=80`;

/** El titular se reparte en líneas por frases ("Tu nombre. Tu número.") para revelarlas una a una. */
function splitLines(text: string) {
  return text.split(/(?<=[.!?])\s+/).map((line) => line.trim()).filter(Boolean);
}

function fromCms(slides: CmsSlide[]): HeroSlide[] {
  return slides.map((slide) => ({
    id: slide.id,
    lines: splitLines([slide.title, slide.accent_text].filter(Boolean).join(" ")),
    subtitle: slide.subtitle ?? "",
    cta: { label: slide.cta_label, href: slide.cta_href },
    image: slide.image_path || DEFAULT_IMAGE,
  }));
}

/** Sin diapositivas en el CMS: la de personalización y una por línea, con productos reales del catálogo. */
function fromCatalog(products: Product[], customPrice: number): HeroSlide[] {
  const withPhoto = (product: Product) => Boolean(product.images[0]?.src);
  const notHero = (product: Product) => !product.images[0]?.src.includes(HERO_PHOTO_ID);
  const pick = (matches: (product: Product) => boolean) =>
    products.find((product) => matches(product) && withPhoto(product) && notHero(product)) ?? products.find((product) => matches(product) && withPhoto(product));
  const newSeason = pick((product) => product.brand === "FUTBOL" && product.badge === "NUEVO");
  const retro = pick((product) => product.category === "FUTBOL_RETRO");
  const training = pick((product) => product.brand === "TRAINING");

  const slides: Array<HeroSlide | null> = [
    {
      id: "dorsal",
      lines: ["Tu nombre.", "Tu número.", "Tu camiseta."],
      subtitle: `Camisetas de diseño propio inspiradas en la historia del fútbol. Ponle tu nombre y tu número por $${formatCurrency(customPrice)} más.`,
      cta: { label: "PERSONALIZA LA TUYA", href: "/personaliza" },
      image: DEFAULT_IMAGE,
      position: "62% center",
    },
    newSeason
      ? { id: "nueva-temporada", lines: ["Nuevo en", "la cancha."], subtitle: `${newSeason.name}, $${formatCurrency(newSeason.price.amount)}.`, cta: { label: "VER LA CAMISETA", href: `/productos/${newSeason.slug}` }, image: newSeason.images[0].src }
      : null,
    retro
      ? { id: "retro", lines: ["Historia", "que se viste."], subtitle: "Camisetas retro inspiradas en las épocas que marcaron el fútbol.", cta: { label: "VER RETRO", href: "/categorias/futbol-retro" }, image: retro.images[0].src }
      : null,
    training
      ? { id: "training", lines: ["Entrena", "para el juego."], subtitle: "Camisetas, pantalonetas y buzos para tus sesiones de entrenamiento.", cta: { label: "VER TRAINING", href: "/training" }, image: training.images[0].src }
      : null,
  ];
  return slides.filter((slide): slide is HeroSlide => slide !== null);
}

const delay = (ms: number): CSSProperties => ({ animationDelay: `${ms}ms` });

const ICONS = {
  prev: <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="size-5 fill-none stroke-current stroke-[1.75]"><path d="M15 5 8 12l7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  next: <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="size-5 fill-none stroke-current stroke-[1.75]"><path d="m9 5 7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  pause: <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="size-5 fill-current"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" /></svg>,
  play: <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="size-5 fill-current"><path d="M8 5v14l11-7z" /></svg>,
};

const CONTROL =
  "grid size-11 cursor-pointer place-items-center rounded-button border border-solid border-white/40 bg-night/30 p-0 text-white transition-colors duration-(--duration-press) hover:border-white hover:bg-white/10 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-action-on-dark motion-safe:active:scale-[0.96]";

/**
 * Hero en carrusel: diapositivas del CMS o, si no hay, generadas con productos reales.
 * Fundido entre fotos, la activa se acerca muy despacio, el titular se revela línea a línea y una
 * barra de progreso marca el tiempo de cada diapositiva. El avance lo dispara el fin de esa
 * animación: sin temporizadores, la pausa (botón, hover, foco) y el progreso no se desincronizan, y
 * con movimiento reducido no hay animación, así que el carrusel no avanza solo (WCAG 2.2.2).
 */
export function HomeHero({ products, slides: cmsSlides, customPrice }: Readonly<{ products: Product[]; slides?: CmsSlide[]; customPrice: number }>) {
  // Diapositivas del CMS que enlazan a secciones ocultas (Training, Streetwear) no se muestran.
  const visibleCmsSlides = (cmsSlides ?? []).filter((slide) => isPublicHrefEnabled(slide.cta_href));
  const slides = visibleCmsSlides.length ? fromCms(visibleCmsSlides) : fromCatalog(products, customPrice);
  const [active, setActive] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const pointerStart = useRef<number | null>(null);
  const paused = userPaused || hovered || focused;
  const count = slides.length;

  if (count === 0) return null;
  const go = (index: number) => setActive(((index % count) + count) % count);

  return (
    <section
      className="relative isolate min-h-[88svh] touch-pan-y overflow-hidden bg-night text-white lg:min-h-[min(100svh,56rem)]"
      aria-roledescription="carrusel"
      aria-label="Destacados de LR7"
      onPointerEnter={(event) => { if (event.pointerType === "mouse") setHovered(true); }}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
      // touch-pan-y: el scroll vertical sigue siendo del navegador y el gesto horizontal llega aquí.
      onPointerDown={(event) => { if (event.pointerType !== "mouse") pointerStart.current = event.clientX; }}
      onPointerCancel={() => { pointerStart.current = null; }}
      onPointerUp={(event) => {
        const start = pointerStart.current;
        pointerStart.current = null;
        if (start === null) return;
        const dx = event.clientX - start;
        if (Math.abs(dx) > 50) go(active + (dx < 0 ? 1 : -1));
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") go(active + 1);
        if (event.key === "ArrowLeft") go(active - 1);
      }}
    >
      {slides.map((slide, index) => {
        const isActive = index === active;
        const textDelay = 120 + slide.lines.length * 60;
        const Heading = index === 0 ? "h1" : "h2";
        return (
          <div
            key={slide.id}
            role="group"
            aria-roledescription="diapositiva"
            aria-label={`${index + 1} de ${count}`}
            aria-hidden={!isActive}
            inert={!isActive}
            className={`absolute inset-0 flex items-end transition-opacity duration-700 ease-out motion-reduce:transition-none ${isActive ? "z-10 opacity-100" : "z-0 opacity-0"}`}
          >
            <div className="absolute inset-0 -z-20 overflow-hidden" aria-hidden="true">
              <Image
                src={slide.image}
                alt=""
                fill
                sizes="100vw"
                loading={index === 0 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : "low"}
                className={`object-cover transition-transform ease-linear motion-reduce:transition-none ${isActive ? "scale-100 duration-[8000ms]" : "scale-[1.06] duration-0"}`}
                style={{ objectPosition: slide.position ?? "center" }}
              />
            </div>
            {/* Velo funcional: oscurece donde va el texto (abajo en móvil, a la izquierda en escritorio) y bajo la cabecera. */}
            <div className="absolute inset-0 -z-10 bg-linear-to-t from-night via-night/70 to-night/20 lg:bg-linear-to-r lg:from-night/95 lg:via-night/65 lg:to-night/10" aria-hidden="true" />
            <div className="absolute inset-x-0 top-0 -z-10 h-40 bg-linear-to-b from-night/80 to-transparent" aria-hidden="true" />

            {/* key: al activarse, el bloque se monta de nuevo y la entrada del titular se repite. */}
            <div key={isActive ? `on-${active}` : "off"} className="mx-auto w-full max-w-[1440px] px-4 pt-32 pb-32 md:px-8 lg:pb-36">
              <Heading id={index === 0 ? "home-hero-title" : undefined} className="m-0 max-w-[12ch] font-heading text-[clamp(3.25rem,11vw,7rem)] leading-[0.88] font-black tracking-[-0.01em] uppercase italic">
                {slide.lines.map((line, lineIndex) => (
                  <span key={line} className="block overflow-hidden pb-[0.04em]">
                    <span className={`block ${isActive ? "motion-safe:animate-hero-line" : ""}`} style={delay(lineIndex * 60)}>{line}</span>
                  </span>
                ))}
              </Heading>
              {slide.subtitle ? (
                <p className={`mt-6 mb-0 max-w-[46ch] text-body leading-relaxed text-white/80 md:text-[1.125rem] ${isActive ? "motion-safe:animate-hero-fade" : ""}`} style={delay(textDelay)}>
                  {slide.subtitle}
                </p>
              ) : null}
              <div className={`mt-8 flex flex-wrap gap-3 max-sm:flex-col ${isActive ? "motion-safe:animate-hero-fade" : ""}`} style={delay(textDelay + 100)}>
                <Link href={slide.cta.href} className="btn-primary min-h-13 justify-center px-8">{slide.cta.label}</Link>
                <Link href="/tienda" className="btn-on-dark min-h-13 justify-center px-8">VER LA TIENDA</Link>
              </div>
            </div>
          </div>
        );
      })}

      {count > 1 ? (
        <div className="absolute inset-x-0 bottom-0 z-20">
          <div className="home-hero-controls mx-auto flex w-full max-w-[1440px] items-center gap-4 px-4 pb-6 md:px-8 lg:pb-10 [body:has(.whatsapp-float)_&]:pr-[84px] lg:[body:has(.whatsapp-float)_&]:pr-[220px]">
            <ol className="m-0 flex flex-1 list-none items-center gap-2 p-0">
              {slides.map((slide, index) => (
                <li key={slide.id} className="max-w-28 flex-1">
                  <button
                    type="button"
                    className="group grid min-h-11 w-full cursor-pointer content-center gap-2 border-0 bg-transparent px-0 py-2 text-left text-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-action-on-dark"
                    onClick={() => go(index)}
                    aria-label={`Ir a la diapositiva ${index + 1} de ${count}`}
                    aria-current={index === active ? "true" : undefined}
                  >
                    <span className={`font-heading text-caption font-bold tracking-[0.12em] ${index === active ? "text-white" : "text-white/70 group-hover:text-white"}`}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="relative block h-0.5 overflow-hidden bg-white/30" aria-hidden="true">
                      {index === active ? (
                        <span
                          key={active}
                          className="absolute inset-0 origin-left scale-x-0 bg-white motion-safe:animate-hero-progress motion-reduce:scale-x-100"
                          style={{ animationPlayState: paused ? "paused" : "running" }}
                          onAnimationEnd={() => go(active + 1)}
                        />
                      ) : null}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
            <div className="flex gap-2">
              <button type="button" className={CONTROL} onClick={() => setUserPaused((value) => !value)} aria-label={userPaused ? "Reanudar el carrusel" : "Pausar el carrusel"}>
                {userPaused ? ICONS.play : ICONS.pause}
              </button>
              <button type="button" className={`${CONTROL} max-sm:hidden`} onClick={() => go(active - 1)} aria-label="Diapositiva anterior">{ICONS.prev}</button>
              <button type="button" className={`${CONTROL} max-sm:hidden`} onClick={() => go(active + 1)} aria-label="Diapositiva siguiente">{ICONS.next}</button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
