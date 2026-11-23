import { ZodError } from "zod";

/**
 * Server Actions must return errors instead of throwing them: in production Next.js
 * replaces thrown messages with a generic digest, so the admin never sees the reason.
 */
export type AdminActionResult<T = null> = { ok: true; data: T } | { ok: false; error: string };

/** An error whose message is safe and useful to show to the admin. */
export class AdminActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminActionError";
  }
}

export const GENERIC_ADMIN_ERROR = "No fue posible guardar los cambios. Revisa los datos e inténtalo de nuevo.";

const FIELD_LABELS: Record<string, string> = {
  name: "Nombre",
  slug: "Slug",
  description: "Descripción",
  price: "Precio",
  compare_at_price: "Precio anterior",
  brand: "Marca / línea",
  team: "Equipo",
  badge: "Badge",
  category_id: "Categoría",
  parent_id: "Categoría padre",
  sku: "SKU",
  size: "Talla",
  color: "Color",
  price_override: "Precio de la variante",
  stock: "Stock",
  low_stock_threshold: "Umbral de stock bajo",
  sort_order: "Orden",
  image_path: "Ruta de imagen",
  eyebrow: "Etiqueta",
  title: "Título",
  accent_text: "Acento",
  subtitle: "Subtítulo",
  cta_label: "Texto del CTA",
  cta_href: "Destino del CTA",
  href: "Destino",
  label: "Etiqueta",
  location: "Ubicación",
  section_key: "Clave",
  section_type: "Tipo",
  page_key: "Página",
  content_key: "Clave",
  body: "Cuerpo",
  configuration: "Configuración JSON",
  setting_key: "Clave",
  value: "Valor JSON",
  alt_text: "Texto alternativo",
  status: "Estado",
  role: "Rol",
};

type ZodIssue = ZodError["issues"][number];

function describeIssue(issue: ZodIssue) {
  const details = issue as ZodIssue & { origin?: string; minimum?: number | bigint; maximum?: number | bigint; expected?: string; format?: string };
  switch (issue.code) {
    case "too_small":
      if (details.origin === "string") return Number(details.minimum) <= 1 ? "es obligatorio" : `debe tener al menos ${details.minimum} caracteres`;
      return `debe ser mayor o igual a ${details.minimum}`;
    case "too_big":
      if (details.origin === "string") return `admite máximo ${details.maximum} caracteres`;
      return `debe ser menor o igual a ${details.maximum}`;
    case "invalid_format":
      if (details.format === "uuid") return "no es un identificador válido";
      return "tiene un formato no válido";
    case "invalid_value":
      return "tiene un valor no permitido";
    case "invalid_type":
      if (details.expected === "number" || details.expected === "int") return "debe ser un número entero";
      return "es obligatorio";
    default:
      return "no es válido";
  }
}

const FORMAT_HINTS: Record<string, string> = {
  slug: "usa solo minúsculas, números y guiones",
  section_key: "usa solo minúsculas, números y guiones",
  page_key: "usa solo minúsculas, números y guiones",
  content_key: "usa solo minúsculas, números y guiones",
  setting_key: "usa solo minúsculas, números y guiones bajos",
  href: "debe empezar por / o https://",
  cta_href: "debe empezar por / o https://",
};

const CUSTOM_HINTS: Record<string, string> = {
  compare_at_price: "debe ser mayor que el precio actual o quedar vacío",
};

export function formatZodError(error: ZodError) {
  const issue = error.issues[0];
  if (!issue) return GENERIC_ADMIN_ERROR;
  const field = typeof issue.path[0] === "string" ? issue.path[0] : "";
  const label = FIELD_LABELS[field] ?? "Un campo";
  const hint = issue.code === "invalid_format" ? FORMAT_HINTS[field] : issue.code === "custom" ? CUSTOM_HINTS[field] : undefined;
  return `${label}: ${hint ?? describeIssue(issue)}.`;
}

export function toAdminActionError(error: unknown) {
  if (error instanceof AdminActionError) return error.message;
  if (error instanceof ZodError) return formatZodError(error);
  return GENERIC_ADMIN_ERROR;
}

export function isAdminActionFailure(result: unknown): result is { ok: false; error: string } {
  return typeof result === "object" && result !== null && (result as { ok?: unknown }).ok === false && typeof (result as { error?: unknown }).error === "string";
}

/** Returns the payload of a successful result, or the raw value for actions that return nothing. */
export function getAdminActionData(result: unknown) {
  if (typeof result === "object" && result !== null && (result as { ok?: unknown }).ok === true) return (result as { data?: unknown }).data;
  return result;
}
