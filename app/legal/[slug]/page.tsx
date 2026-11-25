import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/layout/page-hero";
import { InfoSection } from "@/components/pages/info-blocks";
import { getContentItems } from "@/lib/content";
import { LEGAL_PAGES } from "@/lib/legal-pages";

type LegalPageProps = Readonly<{ params: Promise<{ slug: string }> }>;

function findPage(slug: string) {
  return LEGAL_PAGES.find((page) => page.slug === slug);
}

export async function generateMetadata({ params }: LegalPageProps): Promise<Metadata> {
  const page = findPage((await params).slug);
  if (!page) return {};
  return { title: page.label, description: page.description, alternates: { canonical: `/legal/${page.slug}` } };
}

/**
 * Documento legal leído del CMS. Sin texto publicado responde 404: el sitio nunca muestra un borrador
 * o un texto inventado como si fuera la política vigente.
 */
export default async function LegalDocumentPage({ params }: LegalPageProps) {
  const page = findPage((await params).slug);
  if (!page) notFound();
  const sections = await getContentItems(page.pageKey);
  if (!sections.length) notFound();
  const updatedAt = sections.reduce((latest, section) => (section.updated_at > latest ? section.updated_at : latest), sections[0].updated_at);

  return (
    <>
      <PageHero title={page.title} sub={`Última actualización: ${new Date(updatedAt).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })}.`} />
      <InfoSection narrow>
        <div className="grid gap-8">
          {sections.map((section) => (
            <section key={section.id} className="grid gap-3">
              {section.title ? <h2 className="m-0 text-title leading-tight font-semibold text-night">{section.title}</h2> : null}
              {(section.body ?? "").split(/\n{2,}/).filter(Boolean).map((paragraph, index) => (
                <p key={index} className="m-0 max-w-[70ch] text-body leading-relaxed whitespace-pre-line text-gray-600">{paragraph}</p>
              ))}
            </section>
          ))}
        </div>
      </InfoSection>
    </>
  );
}
