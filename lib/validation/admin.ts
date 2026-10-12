import { z } from "zod";

const nullableText = (maximum: number) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? null : value),
    z.string().trim().max(maximum).nullable(),
  );

const nullableMoney = z.preprocess(
  (value) => (value === "" || value === null ? null : value),
  z.coerce.number().int().nonnegative().nullable(),
);

export const catalogCategoryNames = [
  "FUTBOL",
  "FUTBOL_CAMISETAS",
  "FUTBOL_RETRO",
  "FUTBOL_CLUBES",
  "FUTBOL_SELECCIONES",
  "FUTBOL_PERSONALIZADO",
  "TRAINING",
  "TRAINING_CAMISETAS",
  "TRAINING_CAMISILLAS",
  "TRAINING_PANTALONETAS",
  "TRAINING_BUZOS",
  "TRAINING_CONJUNTOS",
] as const;

const nullableBadge = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? null : value),
  z.enum(["NUEVO", "MAS VENDIDA", "LIMITADA"]).nullable(),
);

export const productSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().max(5000),
  price: z.coerce.number().int().nonnegative(),
  compare_at_price: nullableMoney,
  brand: z.enum(["FUTBOL", "TRAINING"]),
  team: nullableText(120),
  badge: nullableBadge,
  category_id: z.preprocess(
    (value) => (value === "" || value === null ? null : value),
    z.uuid().nullable(),
  ),
  personalizable: z.boolean(),
  featured: z.boolean(),
  active: z.boolean(),
});

export const categorySchema = z.object({
  name: z.enum(catalogCategoryNames),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: nullableText(1000),
  parent_id: z.preprocess(
    (value) => (value === "" || value === null ? null : value),
    z.uuid().nullable(),
  ),
  sort_order: z.coerce.number().int().nonnegative(),
  active: z.boolean(),
});

export const variantSchema = z.object({
  sku: z.string().trim().min(2).max(100),
  size: z.string().trim().min(1).max(30),
  color: nullableText(80),
  price_override: nullableMoney,
  stock: z.coerce.number().int().nonnegative(),
  low_stock_threshold: z.coerce.number().int().nonnegative(),
  active: z.boolean(),
});

export const inventorySchema = z.object({
  stock: z.coerce.number().int().nonnegative(),
  low_stock_threshold: z.coerce.number().int().nonnegative(),
});

export const orderStatusSchema = z.enum([
  "pending",
  "payment_pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
]);

export const homeSlideSchema = z.object({
  image_path: z.string().trim().min(1).max(500),
  eyebrow: z.string().trim().min(1).max(120),
  title: z.string().trim().min(1).max(180),
  accent_text: nullableText(180),
  subtitle: nullableText(500),
  cta_label: z.string().trim().min(1).max(80),
  cta_href: z.string().trim().regex(/^(\/|https:\/\/)/).max(500),
  sort_order: z.coerce.number().int().nonnegative(),
  active: z.boolean(),
});

export const homeSectionSchema = z.object({
  section_key: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  section_type: z.string().trim().min(1).max(80),
  title: z.string().trim().min(1).max(180),
  eyebrow: nullableText(120),
  subtitle: nullableText(500),
  cta_label: nullableText(80),
  cta_href: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? null : value),
    z.string().trim().regex(/^(\/|https:\/\/)/).max(500).nullable(),
  ),
  sort_order: z.coerce.number().int().nonnegative(),
  active: z.boolean(),
});

export const navigationSchema = z.object({
  location: z.enum(["header", "footer"]),
  label: z.string().trim().min(1).max(80),
  href: z.string().trim().regex(/^(\/|https:\/\/)/).max(500),
  sort_order: z.coerce.number().int().nonnegative(),
  active: z.boolean(),
});

export const userRoleSchema = z.enum(["CUSTOMER", "ADMIN"]);
export const subscriberStatusSchema = z.enum(["pending", "active", "unsubscribed"]);

const nullableUrl = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? null : value),
  z.string().trim().regex(/^(\/|https:\/\/)/).max(500).nullable(),
);

export const contentItemSchema = z.object({
  page_key: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(80),
  content_key: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(80),
  title: z.string().trim().max(240),
  eyebrow: nullableText(240),
  body: nullableText(10000),
  image_path: nullableText(500),
  cta_label: nullableText(120),
  cta_href: nullableUrl,
  configuration: z.record(z.string(), z.unknown()),
  sort_order: z.coerce.number().int().nonnegative(),
  active: z.boolean(),
});

export const siteSettingSchema = z.object({
  setting_key: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:_[a-z0-9]+)*$/).max(80),
  value: z.union([z.record(z.string(), z.unknown()), z.array(z.unknown()), z.string(), z.number(), z.boolean()]),
  active: z.boolean(),
});

export function checkbox(formData: FormData, key: string) {
  return formData.get(key) === "on";
}
