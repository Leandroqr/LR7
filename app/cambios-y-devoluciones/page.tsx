import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";

export const metadata: Metadata = {
  title: "Cambios y devoluciones",
  description: "Politicas de cambio y devolucion de LR7.",
  alternates: { canonical: "/cambios-y-devoluciones" },
};

export default function ReturnsPage() {
  return (
    <>
      <PageHero label="— INFORMACION" title="CAMBIOS Y DEVOLUCIONES" sub="Tu satisfaccion es lo mas importante para nosotros." />
      <section style={{ padding: "5rem 0 7rem", background: "var(--color-white)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1px", background: "rgba(255,255,255,0.06)" }}>
          {[
            "Solicita cambios dentro de los 5 dias habiles despues de recibir tu pedido.",
            "Los productos deben estar sin uso y con etiquetas originales.",
            "Camisetas personalizadas no aplican para cambio, salvo defecto de fabrica.",
            "Defectos de fabrica cuentan con respaldo y reemplazo.",
          ].map((item) => (
            <article key={item} style={{ background: "var(--color-ice)", padding: "2rem" }}>
              <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", lineHeight: 1.7, fontWeight: 300 }}>{item}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
