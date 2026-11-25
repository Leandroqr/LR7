"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WHATSAPP_ICON } from "@/components/layout/whatsapp-float";
import { getSupportLink } from "@/lib/site";
import { getGeneralWhatsAppMessage, trackWhatsAppClick } from "@/lib/whatsapp";

const PRIMARY = "btn-primary inline-flex min-h-13 items-center justify-center gap-2 px-6 [&>svg]:size-5";
const SECONDARY = "inline-flex min-h-13 items-center justify-center rounded-button border border-solid border-white/40 px-6 font-heading text-[0.8125rem] font-bold tracking-[0.1em] text-white no-underline uppercase transition-colors duration-200 hover:border-white hover:bg-white/10 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-action-on-dark motion-safe:active:scale-[0.97]";

/**
 * CTA A (2026-11-24): franja de atención al inicio del pie, en todas las páginas con pie.
 * Con número de WhatsApp abre el chat con un mensaje según la página; sin número lleva a /contacto y no
 * promete WhatsApp (marcador temporal de lib/site.ts).
 */
export function SupportBand() {
  const pathname = usePathname();
  const support = getSupportLink(getGeneralWhatsAppMessage(pathname));

  return (
    <section className="border-0 border-b border-solid border-white/10 bg-navy" aria-labelledby="support-band-title">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-10 md:px-8 lg:flex-row lg:items-center lg:justify-between lg:py-12">
        <div className="grid gap-2">
          <h2 id="support-band-title" className="font-display m-0 text-[clamp(1.75rem,3.5vw,2.5rem)] leading-none font-black text-white uppercase italic">
            ¿Dudas con tu talla o tu pedido?
          </h2>
          <p className="m-0 max-w-[52ch] text-body text-white/75">Te ayudamos a elegir la talla, personalizar tu camiseta o seguir tu pedido.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          {support.whatsapp ? (
            <a
              href={support.href}
              target="_blank"
              rel="noopener noreferrer"
              className={PRIMARY}
              onClick={() => trackWhatsAppClick("whatsapp_click", { placement: "support_band", path: pathname })}
            >
              {WHATSAPP_ICON}
              ESCRÍBENOS POR WHATSAPP
              <span className="sr-only"> (se abre en una pestaña nueva)</span>
            </a>
          ) : (
            <Link href={support.href} className={PRIMARY}>CONTÁCTANOS</Link>
          )}
          <Link href="/preguntas-frecuentes" className={SECONDARY}>PREGUNTAS FRECUENTES</Link>
        </div>
      </div>
    </section>
  );
}
