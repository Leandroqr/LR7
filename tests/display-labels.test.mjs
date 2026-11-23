import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { CATEGORIES, PRODUCTS, getBadgeDisplayName, getCategoryDisplayName } from "../lib/products.ts";

test("every catalog category has a readable Spanish label", () => {
  for (const category of new Set([...CATEGORIES.map((item) => item.name), ...PRODUCTS.map((item) => item.category)])) {
    const label = getCategoryDisplayName(category);
    assert.doesNotMatch(label, /_/, `${category} se mostraría como código`);
    assert.notEqual(label, category);
  }
  assert.equal(getCategoryDisplayName("FUTBOL_SELECCIONES"), "Camisetas de selecciones");
});

test("badge codes map to Spanish labels with accents", () => {
  assert.equal(getBadgeDisplayName("MAS VENDIDA"), "MÁS VENDIDA");
  assert.equal(getBadgeDisplayName("LIMITADA"), "EDICIÓN LIMITADA");
  assert.equal(getBadgeDisplayName("NUEVO"), "NUEVO");
  assert.equal(getBadgeDisplayName(null), null);
});

test("storefront components never print raw category or badge codes", () => {
  for (const path of ["components/pages/product-page.tsx", "components/product/product-card.tsx", "components/pages/streetwear-page.tsx"]) {
    const source = readFileSync(path, "utf8");
    assert.doesNotMatch(source, />\s*\{product\.(category|badge)\}/, `${path} muestra un código interno`);
    assert.doesNotMatch(source, /EN \{product\.category\}/);
  }
});

test("fallback catalog copy keeps Spanish accents", () => {
  const names = PRODUCTS.map((product) => product.name);
  assert.ok(names.includes("Selección Colombia"));
  assert.ok(names.includes("Clásico Europeo"));
  const copy = PRODUCTS.flatMap((product) => [product.name, product.description, ...product.images.map((image) => image.alt)]).join(" ");
  assert.doesNotMatch(copy, /\b(Seleccion|Clasico|futbol|diseno|coleccion|edicion|tecnologia)\b/i);
});
