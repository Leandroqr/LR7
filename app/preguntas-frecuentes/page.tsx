import { PageHero } from "@/components/layout/page-hero";
import { FaqList } from "@/components/pages/faq-list";
import { getContentItems } from "@/lib/content";

export default async function FAQPage() {
  const items = await getContentItems("faq");
  return <><PageHero label="— AYUDA" title="PREGUNTAS FRECUENTES" sub="Encuentra respuestas rapidas a las dudas mas comunes." /><section style={{ padding: "5rem 0 7rem", background: "var(--color-white)" }}><div style={{ maxWidth: "860px", margin: "0 auto", padding: "0 2rem" }}>{items.length ? <FaqList items={items} /> : <p className="content-empty">No hay preguntas frecuentes publicadas.</p>}</div></section></>;
}