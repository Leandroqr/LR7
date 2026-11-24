import type { ContentItem } from "@/lib/content";

/**
 * Preguntas frecuentes con <details> nativo (UX8): se abre con clic, Enter o Espacio sin JavaScript y el lector
 * de pantalla anuncia si está abierta. Antes las preguntas eran blancas sobre fondo blanco y la respuesta se
 * animaba con max-height.
 */
export function FaqList({ items }: Readonly<{ items: ContentItem[] }>) {
  return (
    <div className="border-0 border-t border-solid border-gray-200">
      {items.map((item) => (
        <details key={item.id} className="group border-0 border-b border-solid border-gray-200">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-night focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-action [&::-webkit-details-marker]:hidden">
            <span className="text-[1.0625rem] leading-snug font-semibold">{item.title}</span>
            <svg className="size-5 shrink-0 fill-none stroke-current stroke-[1.75] transition-transform duration-200 ease-out group-open:rotate-45 motion-reduce:transition-none" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
          </summary>
          <p className="m-0 max-w-[68ch] pb-5 text-body leading-relaxed text-gray-600">{item.body}</p>
        </details>
      ))}
    </div>
  );
}
