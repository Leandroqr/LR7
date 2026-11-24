import { PageHero } from "@/components/layout/page-hero";
import { FaqList } from "@/components/pages/faq-list";
import { InfoSection } from "@/components/pages/info-blocks";
import { getContentItems } from "@/lib/content";

export default async function FAQPage() {
  const items = await getContentItems("faq");
  return (
    <>
      <PageHero title="PREGUNTAS FRECUENTES" sub="Respuestas rápidas sobre tallas, personalización, envíos y pagos." />
      <InfoSection narrow>
        {items.length ? <FaqList items={items} /> : <p className="m-0 py-8 text-body text-gray-600">Todavía no hay preguntas frecuentes publicadas.</p>}
      </InfoSection>
    </>
  );
}
