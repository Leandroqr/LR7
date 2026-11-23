import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";
import { ROBOTS_DISALLOW } from "../lib/robots-rules.ts";

const isBlocked = (path) => ROBOTS_DISALLOW.some((rule) => path.startsWith(rule));

test("blocks private, per-user and non-content routes", () => {
  for (const path of ["/admin", "/admin/login", "/api/webhooks/wompi", "/auth/callback", "/checkout/estado/abc", "/carrito", "/favoritos", "/buscar?q=x"]) {
    assert.equal(isBlocked(path), true, `${path} debería estar bloqueada`);
  }
});

test("keeps every public catalog and content route crawlable", () => {
  for (const path of ["/", "/tienda", "/futbol", "/training", "/streetwear", "/colecciones", "/categorias/futbol", "/productos/seleccion-colombia", "/personaliza", "/guia-de-tallas", "/envios", "/cambios-y-devoluciones", "/preguntas-frecuentes", "/nosotros", "/contacto"]) {
    assert.equal(isBlocked(path), false, `${path} debería poder rastrearse`);
  }
});

test("each blocked prefix matches an existing app route", () => {
  for (const rule of ROBOTS_DISALLOW) {
    assert.equal(existsSync(`app${rule.replace(/\/$/, "")}`), true, `app${rule} no existe`);
  }
});
