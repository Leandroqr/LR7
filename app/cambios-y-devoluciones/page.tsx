import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { InfoCards, InfoSection } from "@/components/pages/info-blocks";
import { getContentItems } from "@/lib/content";

export const metadata: Metadata = { title: "Cambios y devoluciones", description: "Políticas de cambio y devolución de LR7.", alternates: { canonical: "/cambios-y-devoluciones" } };

export default async function ReturnsPage() {
  const items = await getContentItems("returns");
  return (
    <>
      <PageHero title="CAMBIOS Y DEVOLUCIONES" sub="Plazos y condiciones para cambiar tu pedido." />
      <InfoSection>
        <InfoCards items={items} empty="Todavía no hay políticas de cambio publicadas." />
      </InfoSection>
    </>
  );
}
