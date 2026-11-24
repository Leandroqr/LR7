import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { InfoCards, InfoSection } from "@/components/pages/info-blocks";
import { getContentItems } from "@/lib/content";

export const metadata: Metadata = { title: "Envíos", description: "Información de envíos y tiempos de entrega en Colombia.", alternates: { canonical: "/envios" } };

export default async function ShippingPage() {
  const items = await getContentItems("shipping");
  return (
    <>
      <PageHero title="ENVÍOS" sub="Cómo y cuándo llega tu camiseta." />
      <InfoSection>
        <InfoCards items={items} empty="Todavía no hay información de envíos publicada." />
      </InfoSection>
    </>
  );
}
