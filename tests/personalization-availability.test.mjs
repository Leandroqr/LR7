import assert from "node:assert/strict";
import test from "node:test";
import { isPersonalizationVariantAvailable } from "../lib/catalog/personalization-availability.ts";

test("keeps availability unknown when no server inventory result exists", () => {
  assert.equal(isPersonalizationVariantAvailable("buzo-training", { size: "M" }, null), true);
  assert.equal(isPersonalizationVariantAvailable("buzo-training", {}, ["buzo-training-M"]), true);
});

test("uses catalog SKU or seeded slug-size mapping and hides only variants with no stock", () => {
  assert.equal(isPersonalizationVariantAvailable("buzo-training", { size: "M", sku: " sku-m " }, ["sku-m"]), true);
  assert.equal(isPersonalizationVariantAvailable("buzo-training", { size: "M" }, ["buzo-training-M"]), true);
  assert.equal(isPersonalizationVariantAvailable("buzo-training", { size: "M" }, []), false);
});
