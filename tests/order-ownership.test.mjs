import assert from "node:assert/strict";
import test from "node:test";
import { isOrderOwnedByUser } from "../lib/payments/order-ownership.ts";

test("allows only the authenticated owner to prepare an order payment", () => {
  assert.equal(isOrderOwnedByUser("user-1", "user-1"), true);
  assert.equal(isOrderOwnedByUser("user-1", "user-2"), false);
  assert.equal(isOrderOwnedByUser(null, "user-1"), false);
  assert.equal(isOrderOwnedByUser("user-1", null), false);
});
