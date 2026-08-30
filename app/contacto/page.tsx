"use client";

import { useState } from "react";
import { PageHero } from "@/components/layout/page-hero";
import { getWhatsAppUrl } from "@/lib/site";
import { trackWhatsAppClick } from "@/lib/whatsapp";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  return (
    <>
      <PageHero label="— CONTACTO" title="HABLEMOS" />
      <section style={{ padding: "5rem 0 7rem", background: "var(--color-white)" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 2rem" }}>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const whatsappUrl = getWhatsAppUrl(`Nombre: ${name}\nEmail: ${email}\nMensaje: ${message}`);
              if (whatsappUrl) {
                trackWhatsAppClick("whatsapp_click", { placement: "contact_form" });
                window.open(whatsappUrl, "_blank", "noopener,noreferrer");
              }
            }}
            style={{ display: "flex", flexDirection: "column", gap: "1.25rem", background: "#0f0f0f", padding: "2.5rem" }}
          >
            <label style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.65rem", letterSpacing: "0.18em", color: "rgba(255,255,255,0.4)", fontFamily: "'Barlow Condensed'", fontWeight: 700, textTransform: "uppercase" }}>NOMBRE</span>
              <input value={name} onChange={(event) => setName(event.target.value)} required style={{ width: "100%", padding: "0.85rem 1rem", background: "var(--color-ice)", border: "1px solid var(--color-border)", color: "var(--color-dark)", fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "0.9rem", outline: "none" }} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.65rem", letterSpacing: "0.18em", color: "rgba(255,255,255,0.4)", fontFamily: "'Barlow Condensed'", fontWeight: 700, textTransform: "uppercase" }}>EMAIL</span>
              <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required style={{ width: "100%", padding: "0.85rem 1rem", background: "var(--color-ice)", border: "1px solid var(--color-border)", color: "var(--color-dark)", fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "0.9rem", outline: "none" }} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.65rem", letterSpacing: "0.18em", color: "rgba(255,255,255,0.4)", fontFamily: "'Barlow Condensed'", fontWeight: 700, textTransform: "uppercase" }}>MENSAJE</span>
              <textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={5} required style={{ width: "100%", padding: "0.85rem 1rem", background: "var(--color-ice)", border: "1px solid var(--color-border)", color: "var(--color-dark)", fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "0.9rem", outline: "none", resize: "vertical" }} />
            </label>
            <button type="submit" className="btn-primary" disabled={!getWhatsAppUrl()} style={{ justifyContent: "center" }}>
              ENVIAR MENSAJE
            </button>
            {!getWhatsAppUrl() ? (
              <output style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.85rem", margin: 0 }}>
                El canal de contacto está en configuración.
              </output>
            ) : null}
          </form>
        </div>
      </section>
    </>
  );
}
