import assert from "node:assert/strict";
import test from "node:test";
import { firstParam, pickOption, sanitizeAdminSearch } from "../lib/admin/search.ts";
import { slugify } from "../lib/admin/slug.ts";

test("removes PostgREST filter grammar from admin search terms", () => {
  assert.equal(sanitizeAdminSearch("camiseta,active.eq.false"), "camiseta active.eq.false");
  assert.equal(sanitizeAdminSearch("a)or(id.neq.0"), "a or id.neq.0");
  assert.equal(sanitizeAdminSearch("100% *algodón* \\ \"x\" 'y' a:b"), "100 algodón x y a b");
  assert.equal(sanitizeAdminSearch("   "), "");
  assert.equal(sanitizeAdminSearch(undefined), "");
  assert.equal(sanitizeAdminSearch("x".repeat(200)).length, 80);
});

test("reads single search params and allow-lists filter options", () => {
  assert.equal(firstParam(["uno", "dos"]), "uno");
  assert.equal(firstParam(undefined), "");
  assert.equal(pickOption("active", ["all", "active"], "all"), "active");
  assert.equal(pickOption("drop table", ["all", "active"], "all"), "all");
});

test("builds URL slugs from product names", () => {
  assert.equal(slugify("Camiseta Selección Colombia 2026"), "camiseta-seleccion-colombia-2026");
  assert.equal(slugify("  ¡Retro Ñandú!  "), "retro-nandu");
  assert.match(slugify("x ".repeat(100)), /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
});
