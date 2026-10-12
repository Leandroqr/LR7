import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { getContentItems } from "@/lib/content";

export const metadata: Metadata = { title: "Envios", description: "Informacion de envios y tiempos de entrega en Colombia.", alternates: { canonical: "/envios" } };
export default async function ShippingPage() { const items = await getContentItems("shipping"); return <><PageHero label="— INFORMACION" title="ENVIOS" sub="Todo lo que necesitas saber sobre como llega tu camiseta." /><section style={{ padding: "5rem 0 7rem", background: "var(--color-white)" }}><div className="content-card-grid">{items.map((item) => <article key={item.id}><h2>{item.title}</h2><p>{item.body}</p></article>)}{!items.length ? <p className="content-empty">No hay información de envíos publicada.</p> : null}</div></section></>; }