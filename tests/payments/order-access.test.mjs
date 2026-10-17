import assert from "node:assert/strict";
import test from "node:test";
import { getOrderAccessCookieName, hashOrderAccessToken, matchesOrderAccessToken } from "../../lib/payments/order-access.ts";

test("binds guest order cookies to a UUID and hashes the bearer token", () => {
  const orderId = "123e4567-e89b-42d3-a456-426614174000";
  assert.equal(getOrderAccessCookieName(orderId), `lr7_order_${orderId}`);
  assert.equal(getOrderAccessCookieName("https://attacker.test"), null);
  const tokenHash = hashOrderAccessToken("opaque-token");
  assert.match(tokenHash, /^[a-f0-9]{64}$/);
  assert.equal(matchesOrderAccessToken("opaque-token", tokenHash), true);
  assert.equal(matchesOrderAccessToken("wrong-token", tokenHash), false);
});
