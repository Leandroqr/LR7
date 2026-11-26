import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { CONSENT_STORAGE_KEY, itemsValue, parseConsent, parseMeasurementId, toAnalyticsItem, trackEcommerce } from "../lib/analytics.ts";
import { classifyOrder, periodStart, summarizeCheckoutFunnel } from "../lib/admin/checkout-funnel.ts";

test("GA4: only a well-formed measurement ID enables analytics; consent is an explicit choice", () => {
  assert.equal(parseMeasurementId(" g-abc123xyz9 "), "G-ABC123XYZ9");
  assert.equal(parseMeasurementId(""), "");
  assert.equal(parseMeasurementId(undefined), "");
  assert.equal(parseMeasurementId("UA-12345-1"), "", "Universal Analytics ya no existe");
  assert.equal(parseMeasurementId("G-<script>"), "");
  assert.equal(parseConsent("granted"), "granted");
  assert.equal(parseConsent("denied"), "denied");
  assert.equal(parseConsent("yes"), null);
  assert.equal(parseConsent(null), null);
  assert.equal(CONSENT_STORAGE_KEY, "lr7-consent-analytics");
});

test("GA4: products map to ecommerce items in whole COP", () => {
  const product = { id: 7, name: "Colombia Local", category: "FUTBOL_SELECCIONES", team: "Colombia", price: { amount: 189000 } };
  assert.deepEqual(toAnalyticsItem(product, { index: 2 }), {
    item_id: "7", item_name: "Colombia Local", item_brand: "LR7", item_category: "FUTBOL_SELECCIONES", item_category2: "Colombia", price: 189000, quantity: 1, index: 2,
  });
  const line = toAnalyticsItem(product, { price: 204000.4, quantity: 2, variant: "M" });
  assert.equal(line.price, 204000);
  assert.equal(line.item_variant, "M");
  assert.equal(itemsValue([line, toAnalyticsItem(product)]), 204000 * 2 + 189000);
  // Sin navegador ni consentimiento no hay gtag: llamar no debe fallar.
  assert.doesNotThrow(() => trackEcommerce("add_to_cart", [line]));
});

test("GA4 loads only after consent, never in admin, and the checkout code is untouched", () => {
  const component = readFileSync("components/analytics/analytics.tsx", "utf8");
  assert.match(component, /consent === "granted" \? \(\s*<Script/, "gtag.js solo se carga tras aceptar");
  assert.match(component, /if \(!GA_MEASUREMENT_ID\) return null;/);
  assert.match(component, /ad_storage: "denied"/, "sin publicidad personalizada");
  const shell = readFileSync("components/layout/site-shell.tsx", "utf8");
  assert.ok(shell.indexOf('pathname.startsWith("/admin")') < shell.indexOf("<Analytics />"), "el admin no carga analítica");
  for (const file of ["components/commerce/checkout-panel.tsx", "components/commerce/wompi-checkout.tsx"]) {
    assert.doesNotMatch(readFileSync(file, "utf8"), /analytics/, `${file} no se modifica`);
  }
  assert.match(readFileSync("app/carrito/page.tsx", "utf8"), /closest\("#lr7-checkout-form"\)/);
  assert.match(readFileSync(".env.example", "utf8"), /^NEXT_PUBLIC_GA_MEASUREMENT_ID=$/m);
});

test("admin funnel classifies orders without new schema", () => {
  const now = new Date("2026-11-26T12:00:00Z");
  const later = "2026-11-26T12:30:00Z";
  const earlier = "2026-11-26T11:00:00Z";
  const orders = [
    { id: "a", status: "paid", total: 100, created_at: earlier, reservation_expires_at: null },
    { id: "b", status: "delivered", total: 200, created_at: earlier, reservation_expires_at: null },
    { id: "c", status: "payment_pending", total: 300, created_at: earlier, reservation_expires_at: later },
    { id: "d", status: "pending", total: 400, created_at: earlier, reservation_expires_at: null },
    { id: "e", status: "cancelled", total: 500, created_at: earlier, reservation_expires_at: null },
    { id: "f", status: "payment_pending", total: 600, created_at: earlier, reservation_expires_at: earlier },
  ];
  const rejected = new Set(["d"]);
  assert.equal(classifyOrder(orders[2], rejected, now), "in_progress");
  assert.equal(classifyOrder(orders[3], rejected, now), "rejected");
  assert.equal(classifyOrder(orders[4], rejected, now), "abandoned");
  assert.equal(classifyOrder(orders[5], rejected, now), "abandoned", "reserva vencida aunque el cron no la haya cerrado");
  const summary = summarizeCheckoutFunnel(orders, rejected, now);
  assert.deepEqual(summary.started, { count: 6, value: 2100 });
  assert.deepEqual(summary.paid, { count: 2, value: 300 });
  assert.deepEqual(summary.in_progress, { count: 1, value: 300 });
  assert.deepEqual(summary.rejected, { count: 1, value: 400 });
  assert.deepEqual(summary.abandoned, { count: 2, value: 1100 });
  assert.equal(summary.conversionRate, 2 / 5);
  assert.equal(summary.abandonmentRate, 3 / 5);
  assert.equal(summarizeCheckoutFunnel([], new Set(), now).conversionRate, null);
  assert.equal(periodStart("7", now).toISOString(), "2026-11-19T12:00:00.000Z");
});
