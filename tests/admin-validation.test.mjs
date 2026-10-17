import assert from "node:assert/strict";
import test from "node:test";
import {
  categorySchema,
  checkbox,
  contentItemSchema,
  fulfillmentStatusSchema,
  homeSectionSchema,
  homeSlideSchema,
  inventorySchema,
  navigationSchema,
  orderStatusSchema,
  productSchema,
  siteSettingSchema,
  subscriberStatusSchema,
  userRoleSchema,
  variantSchema,
} from "../lib/validation/admin.ts";

const validForms = [
  ["product", productSchema, { name: "Producto de prueba", slug: "producto-prueba", description: "", price: "99000", compare_at_price: "", brand: "FUTBOL", team: "", badge: "", category_id: "", personalizable: false, featured: false, active: true }],
  ["category", categorySchema, { name: "FUTBOL", slug: "futbol-prueba", description: "", parent_id: "", sort_order: "1", active: true }],
  ["variant", variantSchema, { sku: "LR7-TEST-1", size: "M", color: "", price_override: "", stock: "2", low_stock_threshold: "1", active: true }],
  ["inventory", inventorySchema, { stock: "2", low_stock_threshold: "1" }],
  ["home slide", homeSlideSchema, { image_path: "/hero.webp", eyebrow: "LR7", title: "Temporada", accent_text: "", subtitle: "", cta_label: "Ver tienda", cta_href: "/tienda", sort_order: "1", active: true }],
  ["home section", homeSectionSchema, { section_key: "temporada-test", section_type: "highlights", title: "Temporada", eyebrow: "", subtitle: "", cta_label: "", cta_href: "", sort_order: "1", active: true }],
  ["navigation", navigationSchema, { location: "header", label: "Prueba", href: "/prueba", sort_order: "1", active: true }],
  ["content", contentItemSchema, { page_key: "faq", content_key: "pregunta-test", title: "Pregunta", eyebrow: "", body: "Respuesta", image_path: "", cta_label: "", cta_href: "", configuration: {}, sort_order: "1", active: true }],
  ["site setting", siteSettingSchema, { setting_key: "footer_test", value: { text: "Prueba" }, active: true }],
];

for (const [name, schema, value] of validForms) {
  test(`accepts valid ${name} form fields`, () => {
    assert.equal(schema.safeParse(value).success, true);
  });
}

test("rejects invalid amounts and unsafe destinations", () => {
  assert.equal(productSchema.safeParse({ ...validForms[0][2], price: "-1" }).success, false);
  assert.equal(navigationSchema.safeParse({ ...validForms[6][2], href: "javascript:alert(1)" }).success, false);
  assert.equal(homeSlideSchema.safeParse({ ...validForms[4][2], cta_href: "javascript:alert(1)" }).success, false);
  assert.equal(contentItemSchema.safeParse({ ...validForms[7][2], cta_href: "javascript:alert(1)" }).success, false);
});

test("validates role, order, and subscriber status enums", () => {
  assert.equal(userRoleSchema.safeParse("ADMIN").success, true);
  assert.equal(userRoleSchema.safeParse("OWNER").success, false);
  assert.equal(orderStatusSchema.safeParse("shipped").success, true);
  assert.equal(orderStatusSchema.safeParse("unknown").success, false);
  assert.equal(subscriberStatusSchema.safeParse("active").success, true);
  assert.equal(subscriberStatusSchema.safeParse("deleted").success, false);
  assert.equal(fulfillmentStatusSchema.safeParse("shipped").success, true);
  assert.equal(fulfillmentStatusSchema.safeParse("paid").success, false);
});

test("reads checkbox values from submitted FormData", () => {
  const checked = new FormData();
  checked.set("active", "on");
  const unchecked = new FormData();
  assert.equal(checkbox(checked, "active"), true);
  assert.equal(checkbox(unchecked, "active"), false);
});
