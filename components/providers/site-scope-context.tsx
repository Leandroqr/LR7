"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { LegalPage } from "@/lib/legal-pages";
import { isPublicHrefEnabled } from "@/lib/store-scope";

type SiteScope = Readonly<{
  /** Direcciones que no se enlazan: categorías vacías (calculadas en el servidor con el catálogo real). */
  hiddenHrefs: readonly string[];
  /** Documentos legales con texto publicado en el CMS. */
  legalPages: readonly LegalPage[];
}>;

const SiteScopeContext = createContext<SiteScope>({ hiddenHrefs: [], legalPages: [] });

export function SiteScopeProvider({ value, children }: Readonly<{ value: SiteScope; children: ReactNode }>) {
  return <SiteScopeContext.Provider value={value}>{children}</SiteScopeContext.Provider>;
}

export function useSiteScope() {
  const scope = useContext(SiteScopeContext);
  return {
    ...scope,
    /** ¿Se puede enlazar? Falso para secciones ocultas (Training, Streetwear) y categorías vacías. */
    canLink: (href: string) => isPublicHrefEnabled(href) && !scope.hiddenHrefs.includes(href.split("?")[0]),
  };
}
