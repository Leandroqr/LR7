// Reglas del dorsal compartidas por el hero de la home y /personaliza (mismas que el personalizador):
// nombre en mayúsculas, solo letras y espacios; número solo dígitos. Sin dependencias para node --test.
export const DORSAL_NAME_MAX = 12;
export const DORSAL_NUMBER_MAX = 99;

export function sanitizeDorsalName(value: string | undefined | null, maxLength = DORSAL_NAME_MAX) {
  return (value ?? "")
    .toUpperCase()
    .replace(/[^A-ZÁÉÍÓÚÜÑ ]/g, "")
    .replace(/\s{2,}/g, " ")
    .slice(0, maxLength);
}

export function sanitizeDorsalNumber(value: string | undefined | null, max = DORSAL_NUMBER_MAX) {
  return (value ?? "").replace(/\D/g, "").slice(0, String(max).length);
}

/** Enlace a /personaliza con el nombre y el número ya escritos (vacíos no se envían). */
export function personalizeHref(name: string, number: string, productSlug?: string) {
  const params = new URLSearchParams();
  if (productSlug) params.set("producto", productSlug);
  const cleanName = sanitizeDorsalName(name).trim();
  const cleanNumber = sanitizeDorsalNumber(number);
  if (cleanName) params.set("nombre", cleanName);
  if (cleanNumber) params.set("numero", cleanNumber);
  const query = params.toString();
  return query ? `/personaliza?${query}` : "/personaliza";
}
