import assert from "node:assert/strict";
import test from "node:test";
import { getCartSubtotal, getItemUnitPrice } from "../lib/cart-pricing.ts";
const CUSTOM_PRICE = 15000;

const product = { price: { amount: 89000 } };

test("uses the stored unit price when the line has one", () => {
  assert.equal(getItemUnitPrice({ product, unitPrice: 104000, quantity: 1 }, CUSTOM_PRICE), 104000);
});

test("adds the customization price, or the default custom price for legacy lines", () => {
  assert.equal(getItemUnitPrice({ product, customization: { enabled: true, price: 20000 }, quantity: 1 }, CUSTOM_PRICE), 109000);
  assert.equal(getItemUnitPrice({ product, customName: "LR", quantity: 1 }, CUSTOM_PRICE), 89000 + CUSTOM_PRICE);
  assert.equal(getItemUnitPrice({ product, quantity: 1 }, CUSTOM_PRICE), 89000);
});

test("sums every line times its quantity", () => {
  assert.equal(getCartSubtotal([{ product, quantity: 2 }, { product, unitPrice: 50000, quantity: 1 }], CUSTOM_PRICE), 228000);
  assert.equal(getCartSubtotal([], CUSTOM_PRICE), 0);
});
