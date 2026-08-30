import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";

export const metadata: Metadata = {
  title: "Guia de tallas",
  description: "Tabla de tallas y recomendaciones para elegir tu camiseta.",
  alternates: { canonical: "/guia-de-tallas" },
};

const SIZES = [
  { size: "S", chest: "88-92", length: "68", shoulder: "42" },
  { size: "M", chest: "94-98", length: "70", shoulder: "44" },
  { size: "L", chest: "100-104", length: "72", shoulder: "46" },
  { size: "XL", chest: "106-110", length: "74", shoulder: "48" },
  { size: "XXL", chest: "112-118", length: "76", shoulder: "50" },
];

export default function SizeGuidePage() {
  return (
    <>
      <PageHero label="— GUIA" title="ENCUENTRA TU TALLA" sub="Medidas en centimetros. Midete sin ropa para mayor precision." />
      <section style={{ padding: "5rem 0 7rem", background: "var(--color-white)" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto", padding: "0 2rem" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                {["TALLA", "PECHO", "LARGO", "HOMBRO"].map((header) => (
                  <th key={header} style={{ padding: "1rem", textAlign: "left", fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: "0.75rem", letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SIZES.map((row, index) => (
                <tr key={row.size} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: index % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}>
                  <td style={{ padding: "1.1rem 1rem" }}>
                    <span className="font-display" style={{ fontSize: "1.1rem", fontWeight: 900, color: "var(--color-accent)" }}>
                      {row.size}
                    </span>
                  </td>
                  <td style={{ padding: "1.1rem 1rem", fontSize: "0.9rem", color: "rgba(255,255,255,0.7)", fontWeight: 300 }}>{row.chest}</td>
                  <td style={{ padding: "1.1rem 1rem", fontSize: "0.9rem", color: "rgba(255,255,255,0.7)", fontWeight: 300 }}>{row.length}</td>
                  <td style={{ padding: "1.1rem 1rem", fontSize: "0.9rem", color: "rgba(255,255,255,0.7)", fontWeight: 300 }}>{row.shoulder}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
