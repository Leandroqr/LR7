import assert from "node:assert/strict";
import test from "node:test";
import { buildPurchaseInfo, buildSizeGuide } from "../lib/purchase-info.ts";

const item = (title, body, configuration) => ({ title, body, configuration });

test("takes the first two shipping items and the first returns item from the CMS", () => {
  const info = buildPurchaseInfo(
    [item("Cobertura nacional", "Envíos a toda Colombia."), item("Tiempos de entrega", "2 a 5 días hábiles."), item("Seguimiento", "Guía por correo.")],
    [item("Plazo de cambios", "5 días hábiles."), item("Personalizados", "No aplican.")],
  );
  assert.deepEqual(info.map((entry) => entry.title), ["Cobertura nacional", "Tiempos de entrega", "Plazo de cambios"]);
});

test("never invents content: empty or body-less CMS rows produce nothing", () => {
  assert.deepEqual(buildPurchaseInfo([], []), []);
  assert.deepEqual(buildPurchaseInfo([item("Sin texto", null), item("  ", "x")], [item("Vacío", "   ")]), []);
});

test("maps size-guide rows and tolerates missing measurements", () => {
  assert.deepEqual(buildSizeGuide([item("M", null, { chest: "94-98", length: 70, shoulder: "44" }), item("L", null, null), item(" ", null, {})]), [
    { size: "M", chest: "94-98", length: "70", shoulder: "44" },
    { size: "L", chest: "-", length: "-", shoulder: "-" },
  ]);
});
