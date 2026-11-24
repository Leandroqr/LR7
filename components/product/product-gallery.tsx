"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import type { ProductImage } from "@/types/ecommerce";

const SIZES = "(max-width: 900px) 100vw, 50vw";
// Zoom con lupa: solo escritorio con ratón y sin movimiento reducido (DESIGN.md → Motion).
const ZOOM_QUERY = "(min-width: 901px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

/**
 * Galería de la ficha (M4).
 * - Móvil: carril nativo con scroll-snap (sin JS para deslizar) y puntos de posición.
 * - Escritorio: fotos apiladas con fundido de 160 ms, miniaturas y zoom que sigue al cursor.
 * Las fotos inactivas quedan `invisible` en escritorio para que el lector de pantalla no las repita.
 */
export function ProductGallery({ images, productName, overlay }: Readonly<{ images: ProductImage[]; productName: string; overlay?: ReactNode }>) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const zoomImageRef = useRef<HTMLImageElement | null>(null);
  const several = images.length > 1;
  // En móvil el carril se desplaza: tiene que poder enfocarse para moverlo con las flechas del teclado (WCAG 2.1.1).
  // En escritorio no se desplaza y sería una parada de tabulación vacía.
  const [scrollable, setScrollable] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 900px)");
    const update = () => setScrollable(query.matches && images.length > 1);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [images.length]);

  const onScroll = () => {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;
    const index = Math.round(track.scrollLeft / track.clientWidth);
    setActive(Math.max(0, Math.min(images.length - 1, index)));
  };

  // El origen del zoom se escribe directamente en la imagen: moverlo con estado de React re-renderizaría en cada píxel.
  const moveZoom = (event: PointerEvent<HTMLDivElement>) => {
    const image = zoomImageRef.current;
    if (!image) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    image.style.transformOrigin = `${x}% ${y}%`;
  };

  return (
    <>
      <div className="product-main-image">
        <div
          ref={trackRef}
          onScroll={onScroll}
          tabIndex={scrollable ? 0 : undefined}
          role={scrollable ? "region" : undefined}
          aria-label={scrollable ? `Fotos de ${productName}. Desliza para ver más` : undefined}
          className="flex focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-action snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] lg:grid lg:overflow-hidden [&::-webkit-scrollbar]:hidden"
        >
          {images.map((image, index) => {
            const isActive = index === active;
            return (
              <div
                key={image.src}
                data-active={isActive}
                className="product-gallery-slide relative aspect-[4/5] w-full shrink-0 snap-center snap-always overflow-hidden bg-gray-100 lg:col-start-1 lg:row-start-1"
                onPointerEnter={(event) => {
                  if (!isActive || event.pointerType !== "mouse" || !window.matchMedia(ZOOM_QUERY).matches) return;
                  moveZoom(event);
                  setZoom(true);
                }}
                onPointerMove={isActive && zoom ? moveZoom : undefined}
                onPointerLeave={() => setZoom(false)}
              >
                <Image
                  ref={isActive ? zoomImageRef : undefined}
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes={SIZES}
                  loading={index === 0 ? "eager" : "lazy"}
                  fetchPriority={index === 0 ? "high" : undefined}
                  className={`object-cover transition-transform duration-300 ease-out lg:cursor-zoom-in ${isActive && zoom ? "scale-150" : ""}`}
                />
              </div>
            );
          })}
        </div>
        {overlay}
      </div>

      {several ? (
        <>
          {/* Puntos de posición en móvil: informan, no se pulsan (se desliza con el dedo). */}
          <div className="flex justify-center gap-2 lg:hidden" aria-hidden="true">
            {images.map((image, index) => (
              <span
                key={image.src}
                className={`size-2 rounded-full transition-colors duration-200 ${index === active ? "bg-night" : "bg-gray-400"}`}
              />
            ))}
          </div>
          <p className="sr-only" aria-live="polite">{`Foto ${active + 1} de ${images.length}`}</p>
          <div className="product-thumbnails max-lg:hidden" aria-label="Seleccionar imagen">
            {images.map((image, index) => (
              <button
                type="button"
                key={image.src}
                onClick={() => setActive(index)}
                aria-label={`Ver imagen ${index + 1} de ${productName}`}
                aria-pressed={active === index}
                className={active === index ? "is-selected" : ""}
              >
                <Image src={image.src} alt="" fill sizes="80px" />
              </button>
            ))}
          </div>
        </>
      ) : null}
    </>
  );
}
