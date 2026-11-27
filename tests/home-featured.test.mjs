import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { FEATURED_GRID_LIMIT, productSlugFromHref, rankFeatured } from "../lib/home-featured.ts";

const hero = readFileSync("components/pages/home-hero.tsx", "utf8");
const grid = readFileSync("components/pages/home-featured-grid.tsx", "utf8");

test("hero: a slide becomes a product slide only when its button links to a product page", () => {
  assert.equal(productSlugFromHref("/productos/seleccion-colombia"), "seleccion-colombia");
  assert.equal(productSlugFromHref(" /productos/milan-clasico/?talla=M "), "milan-clasico");
  assert.equal(productSlugFromHref("/productos/a#detalle"), "a");
  for (const href of ["/tienda", "/personaliza", "/productos", "/productos/", "https://otra.com/productos/x", "/categorias/futbol-retro"]) {
    assert.equal(productSlugFromHref(href), null, href);
  }
  // Nombre, línea y precio salen del catálogo, nunca del texto del CMS.
  assert.match(hero, /products\.find\(\(item\) => item\.slug === slug\)/);
  assert.match(hero, /price: product\.price\.amount/);
  // La etiqueta del CMS solo se muestra en las de producto (en las de campaña nunca se publicó).
  assert.match(hero, /eyebrow: product \? slide\.eyebrow \|\| undefined : undefined/);
  // La foto también enlaza, pero fuera del orden de tabulación (el botón principal ya lleva allí).
  assert.match(hero, /<Link href=\{href\} tabIndex=\{-1\} aria-hidden="true"/);
});

test("featured grid: badged and in-stock first, catalog order kept, at most two rows", () => {
  const product = (id, badge, stock = true) => ({ id, badge, variants: stock ? [{ size: "M" }] : [] });
  const ranked = rankFeatured([product("a", null), product("b", "NUEVO"), product("c", "LIMITADA", false), product("d", null, false), product("e", "MAS VENDIDA")]);
  assert.deepEqual(ranked.map((item) => item.id), ["b", "e", "a", "c", "d"]);
  assert.equal(FEATURED_GRID_LIMIT, 8);
  // Filtros como botones de alternancia (aria-pressed); solo fútbol; un filtro vacío no se muestra.
  assert.match(grid, /aria-pressed=\{item\.id === filter\.id\}/);
  assert.match(grid, /product\.brand === "FUTBOL"/);
  assert.match(grid, /filter\.id === "all" \|\| football\.some\(filter\.matches\)/);
  assert.match(grid, /<TrackItemList/);
});
