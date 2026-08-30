import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";

export const metadata: Metadata = {
  title: "Envios",
  description: "Informacion de envios y tiempos de entrega en Colombia.",
  alternates: { canonical: "/envios" },
};

export default function ShippingPage() {
  return (
    <>
      <PageHero label="— INFORMACION" title="ENVIOS" sub="Todo lo que necesitas saber sobre como llega tu camiseta." />
      <section style={{ padding: "5rem 0 7rem", background: "var(--color-white)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1px", background: "rgba(255,255,255,0.06)" }}>
          {[
            "Cobertura nacional en Colombia.",
            "Entregas promedio entre 2 y 5 dias habiles.",
            "Seguimiento por guia una vez despachado.",
            "Soporte por WhatsApp para coordinar tiempos y costos.",
          ].map((item) => (
            <article key={item} style={{ background: "var(--color-ice)", padding: "2.5rem" }}>
              <p style={{ fontSize: "0.9rem", color: "var(--color-text-muted)", lineHeight: 1.7, fontWeight: 300 }}>{item}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
