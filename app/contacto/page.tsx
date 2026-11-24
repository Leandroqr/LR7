"use client";

import Link from "next/link";
import { useState } from "react";
import { PageHero } from "@/components/layout/page-hero";
import { InfoSection } from "@/components/pages/info-blocks";
import { getWhatsAppUrl } from "@/lib/site";
import { trackWhatsAppClick } from "@/lib/whatsapp";

// Campos del sistema (DESIGN.md → Inputs): 48 px, borde gris 400, etiqueta visible y foco azul de 3 px.
const LABEL = "grid gap-2 text-body-sm font-medium text-night";
const FIELD = "w-full rounded-none border border-solid border-gray-400 bg-white px-3 font-sans text-body text-night focus-visible:border-action focus-visible:outline-3 focus-visible:outline-action";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const channelReady = Boolean(getWhatsAppUrl());

  return (
    <>
      <PageHero title="HABLEMOS" sub="Escríbenos por WhatsApp: tallas, personalización o tu pedido." />
      <InfoSection narrow>
        <form
          className="grid gap-5 bg-gray-100 p-6 md:p-8"
          onSubmit={(event) => {
            event.preventDefault();
            const whatsappUrl = getWhatsAppUrl(`Nombre: ${name}\nEmail: ${email}\nMensaje: ${message}`);
            if (whatsappUrl) {
              trackWhatsAppClick("whatsapp_click", { placement: "contact_form" });
              window.open(whatsappUrl, "_blank", "noopener,noreferrer");
            }
          }}
        >
          <label className={LABEL}>
            Nombre
            <input className={`${FIELD} h-12`} value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required />
          </label>
          <label className={LABEL}>
            Correo electrónico
            <input className={`${FIELD} h-12`} value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" required />
          </label>
          <label className={LABEL}>
            Mensaje
            <textarea className={`${FIELD} min-h-36 resize-y py-3`} value={message} onChange={(event) => setMessage(event.target.value)} rows={5} required />
          </label>
          <button type="submit" className="btn-primary justify-center" disabled={!channelReady}>
            ENVIAR POR WHATSAPP
          </button>
          {!channelReady ? (
            <output className="m-0 text-body-sm text-gray-600">
              El canal de WhatsApp está en configuración. Mientras tanto, revisa las <Link href="/preguntas-frecuentes" className="text-night underline underline-offset-3">preguntas frecuentes</Link>.
            </output>
          ) : null}
        </form>
      </InfoSection>
    </>
  );
}
