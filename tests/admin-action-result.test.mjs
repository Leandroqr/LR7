import assert from "node:assert/strict";
import test from "node:test";
import {
  AdminActionError,
  GENERIC_ADMIN_ERROR,
  getAdminActionData,
  isAdminActionFailure,
  toAdminActionError,
} from "../lib/admin/action-result.ts";
import { productSchema, variantSchema, navigationSchema } from "../lib/validation/admin.ts";

const validProduct = { name: "Producto de prueba", slug: "producto-prueba", description: "", price: "99000", compare_at_price: "", brand: "FUTBOL", team: "", badge: "", category_id: "", personalizable: false, featured: false, active: true };

function zodErrorFor(schema, value) {
  const result = schema.safeParse(value);
  assert.equal(result.success, false);
  return result.error;
}

test("keeps explicit admin error messages for the UI", () => {
  assert.equal(toAdminActionError(new AdminActionError("Ya existe un registro.")), "Ya existe un registro.");
});

test("hides unexpected internal error details behind a generic message", () => {
  assert.equal(toAdminActionError(new Error("duplicate key value violates constraint products_pkey")), GENERIC_ADMIN_ERROR);
  assert.equal(toAdminActionError("boom"), GENERIC_ADMIN_ERROR);
});

test("turns Zod issues into a readable Spanish message with the field label", () => {
  assert.equal(toAdminActionError(zodErrorFor(productSchema, { ...validProduct, price: "-1" })), "Precio: debe ser mayor o igual a 0.");
  assert.equal(toAdminActionError(zodErrorFor(productSchema, { ...validProduct, slug: "Slug Con Espacios" })), "Slug: usa solo minúsculas, números y guiones.");
  assert.equal(toAdminActionError(zodErrorFor(productSchema, { ...validProduct, name: "" })), "Nombre: debe tener al menos 2 caracteres.");
  assert.equal(toAdminActionError(zodErrorFor(variantSchema, { sku: "LR7-1", size: "M", color: "", price_override: "", stock: "abc", low_stock_threshold: "1", active: true })), "Stock: debe ser un número entero.");
  assert.equal(toAdminActionError(zodErrorFor(navigationSchema, { location: "header", label: "X", href: "javascript:alert(1)", sort_order: "0", active: true })), "Destino: debe empezar por / o https://.");
});

test("explains the compare-at price rule", () => {
  assert.equal(
    toAdminActionError(zodErrorFor(productSchema, { ...validProduct, compare_at_price: "90000" })),
    "Precio anterior: debe ser mayor que el precio actual o quedar vacío.",
  );
});

test("detects failed results and unwraps successful payloads", () => {
  assert.equal(isAdminActionFailure({ ok: false, error: "x" }), true);
  assert.equal(isAdminActionFailure({ ok: true, data: null }), false);
  assert.equal(isAdminActionFailure(undefined), false);
  assert.equal(getAdminActionData({ ok: true, data: "product-id" }), "product-id");
  assert.equal(getAdminActionData(undefined), undefined);
});
