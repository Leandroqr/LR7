import assert from "node:assert/strict";
import test from "node:test";
import { serializeCheckoutCart } from "../lib/checkout/cart.ts";

test("serializes only variant identity, quantity, and customization for checkout", () => {
  const [line] = serializeCheckoutCart([{
    product: { slug: "seleccion-colombia", price: { amount: 1 } },
    variant: { size: "S", sku: " seleccion-colombia-S " },
    size: "S",
    quantity: 2,
    unitPrice: 1,
    customName: "LEO",
    customNumber: "10",
    customization: { enabled: true, price: 1 },
  }]);
  assert.deepEqual(line, {
    sku: "seleccion-colombia-S",
    quantity: 2,
    personalization: { enabled: true, name: "LEO", number: "10" },
  });
  assert.equal("price" in line, false);
});

test("derives a stable SKU for seeded mock products when localStorage has no SKU", () => {
  const [line] = serializeCheckoutCart([{
    product: { slug: "buzo-training" },
    variant: { size: "L" },
    size: "L",
    quantity: 1,
  }]);
  assert.equal(line.sku, "buzo-training-L");
});
