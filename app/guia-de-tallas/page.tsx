import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { InfoSection } from "@/components/pages/info-blocks";
import { getContentItems } from "@/lib/content";

export const metadata: Metadata = { title: "Guía de tallas", description: "Tabla de tallas y recomendaciones para elegir tu camiseta.", alternates: { canonical: "/guia-de-tallas" } };

const CELL = "border-0 border-b border-solid border-gray-200 px-3 py-4 text-left";

export default async function SizeGuidePage() {
  const sizes = await getContentItems("size-guide");
  return (
    <>
      <PageHero title="ENCUENTRA TU TALLA" sub="Medidas en centímetros. Mídete sin ropa para mayor precisión." />
      <InfoSection narrow>
        {sizes.length ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-body text-night">
              <caption className="sr-only">Medidas por talla en centímetros</caption>
              <thead>
                <tr className="text-body-sm text-gray-600">
                  <th scope="col" className={`${CELL} font-semibold`}>Talla</th>
                  <th scope="col" className={`${CELL} font-semibold`}>Pecho</th>
                  <th scope="col" className={`${CELL} font-semibold`}>Largo</th>
                  <th scope="col" className={`${CELL} font-semibold`}>Hombro</th>
                </tr>
              </thead>
              <tbody>
                {sizes.map((row) => {
                  const measurements = row.configuration as { chest?: string; length?: string; shoulder?: string };
                  return (
                    <tr key={row.id}>
                      <th scope="row" className={`${CELL} font-heading text-[1.25rem] font-black`}>{row.title}</th>
                      <td className={CELL}>{measurements.chest ?? "-"}</td>
                      <td className={CELL}>{measurements.length ?? "-"}</td>
                      <td className={CELL}>{measurements.shoulder ?? "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="m-0 py-8 text-body text-gray-600">Todavía no hay tallas publicadas.</p>
        )}
      </InfoSection>
    </>
  );
}
