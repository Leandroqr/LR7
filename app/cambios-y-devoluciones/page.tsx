import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { getContentItems } from "@/lib/content";

export const metadata: Metadata = { title: "Cambios y devoluciones", description: "Politicas de cambio y devolucion de LR7.", alternates: { canonical: "/cambios-y-devoluciones" } };
export default async function ReturnsPage() { const items = await getContentItems("returns"); return <><PageHero label="— INFORMACION" title="CAMBIOS Y DEVOLUCIONES" sub="Tu satisfaccion es lo mas importante para nosotros." /><section style={{ padding: "5rem 0 7rem", background: "var(--color-white)" }}><div className="content-card-grid">{items.map((item) => <article key={item.id}><h2>{item.title}</h2><p>{item.body}</p></article>)}{!items.length ? <p className="content-empty">No hay políticas publicadas.</p> : null}</div></section></>; }