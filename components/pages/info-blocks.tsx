import type { ReactNode } from "react";
import type { ContentItem } from "@/lib/content";

/** Contenedor de las páginas de información (UX8): mismo ancho y márgenes que la cabecera de página. */
export function InfoSection({ children, narrow = false }: Readonly<{ children: ReactNode; narrow?: boolean }>) {
  return (
    <section className="bg-white pb-20 lg:pb-28">
      <div className={`mx-auto w-full px-4 md:px-8 ${narrow ? "max-w-[860px]" : "max-w-[1400px]"}`}>{children}</div>
    </section>
  );
}

/** Textos del CMS (envíos, cambios) como paneles gris 100 sin borde (DESIGN.md → Paneles). */
export function InfoCards({ items, empty }: Readonly<{ items: ContentItem[]; empty: string }>) {
  if (!items.length) return <p className="m-0 py-8 text-body text-gray-600">{empty}</p>;
  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <article key={item.id} className="bg-gray-100 p-6">
          <h2 className="m-0 mb-2 font-sans text-[1.0625rem] leading-snug font-semibold text-night">{item.title}</h2>
          <p className="m-0 text-body leading-relaxed text-gray-600">{item.body}</p>
        </article>
      ))}
    </div>
  );
}
