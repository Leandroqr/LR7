import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/layout/page-hero";
import { CUSTOM_PRICE, formatCurrency } from "@/lib/products";

export const metadata: Metadata = {
  title: "Nosotros",
  description: "LR7 es una tienda colombiana de camisetas de fútbol de diseño propio, inspiradas en la historia del juego y personalizables con tu nombre y tu número.",
  alternates: { canonical: "/nosotros" },
};

// UX8: solo lo que PRODUCT.md confirma (posicionamiento, envíos y cambios publicados). Sin cifras, premios,
// testimonios ni promesas de calidad que no se puedan comprobar.
const REASONS = [
  {
    title: "Tu nombre y tu número",
    body: `Personalizas la espalda en la web y ves cómo queda antes de pedirla, por $${formatCurrency(CUSTOM_PRICE)} más.`,
  },
  {
    title: "Diseño propio",
    body: "Camisetas inspiradas en los colores, las épocas y las selecciones que marcaron la historia del fútbol. No son réplicas oficiales.",
  },
  {
    title: "Precio para jugarla",
    body: "Una camiseta para la cancha y para la calle, por debajo de lo que cuesta una oficial.",
  },
] as const;

const PROMISES = [
  { title: "Envíos a toda Colombia", body: "Entregas de 2 a 5 días hábiles.", href: "/envios", cta: "Ver envíos" },
  { title: "Cambios en 5 días hábiles", body: "Las personalizadas solo se cambian por defecto de fábrica.", href: "/cambios-y-devoluciones", cta: "Ver cambios" },
  { title: "Tallas S a XXL", body: "Con medidas de pecho, largo y hombro en centímetros.", href: "/guia-de-tallas", cta: "Ver la guía" },
] as const;

export default function AboutPage() {
  return (
    <>
      <PageHero title="NACIMOS EN LA CANCHA" sub="LR7 es una tienda colombiana de camisetas de fútbol de diseño propio, pensadas para jugar y para llevar puestas fuera de la cancha." />

      <section className="bg-white pb-16 lg:pb-24" aria-labelledby="about-reasons-title">
        <div className="mx-auto grid w-full max-w-[1400px] gap-8 px-4 md:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
          <div className="relative aspect-[4/5] overflow-hidden bg-gray-100 lg:aspect-[5/6]">
            <Image
              src="https://images.unsplash.com/photo-1490108474814-221f6198acc5?w=1400&h=1600&fit=crop&auto=format"
              alt="Jugador de fútbol visto a través de la red del arco"
              fill
              sizes="(max-width: 900px) 100vw, 55vw"
              className="object-cover"
            />
          </div>
          <div>
            <h2 id="about-reasons-title" className="home-headline font-display m-0 mb-8">Por qué LR7</h2>
            <ul className="m-0 grid list-none gap-6 p-0">
              {REASONS.map((reason) => (
                <li key={reason.title} className="border-0 border-t border-solid border-gray-200 pt-5">
                  <h3 className="m-0 mb-2 text-title leading-tight font-semibold text-night">{reason.title}</h3>
                  <p className="m-0 max-w-[52ch] text-body leading-relaxed text-gray-600">{reason.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-night py-16 text-white lg:py-24" aria-labelledby="about-promises-title">
        <div className="mx-auto w-full max-w-[1400px] px-4 md:px-8">
          <h2 id="about-promises-title" className="home-headline font-display m-0 mb-8 text-white">Compra con calma</h2>
          <ul className="m-0 grid list-none gap-3 p-0 md:grid-cols-3">
            {PROMISES.map((promise) => (
              <li key={promise.title} className="grid content-start gap-2 bg-navy p-6">
                <strong className="text-[1.0625rem] font-semibold">{promise.title}</strong>
                <span className="text-body-sm leading-relaxed text-white/75">{promise.body}</span>
                <Link href={promise.href} className="inline-flex min-h-11 items-center text-body-sm font-semibold text-action-on-dark underline underline-offset-4">{promise.cta}</Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-white py-16 lg:py-24" aria-labelledby="about-cta-title">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col items-start gap-6 px-4 md:px-8">
          <h2 id="about-cta-title" className="home-headline font-display m-0">Encuentra la tuya</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/tienda" className="btn-primary">VER LA TIENDA</Link>
            <Link href="/personaliza" className="btn-outline">PERSONALIZA LA TUYA</Link>
          </div>
        </div>
      </section>
    </>
  );
}
