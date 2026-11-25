import "server-only";

import { getContentItems } from "@/lib/content";
import { LEGAL_PAGES, type LegalPage } from "@/lib/legal-pages";

/** Documentos legales con texto publicado en el CMS (los demás no se enlazan ni se muestran). */
export async function getPublishedLegalPages(): Promise<LegalPage[]> {
  const contents = await Promise.all(LEGAL_PAGES.map((page) => getContentItems(page.pageKey)));
  return LEGAL_PAGES.filter((_, index) => contents[index].length > 0);
}
