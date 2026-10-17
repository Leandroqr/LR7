import assert from "node:assert/strict";
import test from "node:test";
import { parseWompiTransactionResponse } from "../../lib/payments/wompi-transactions.ts";

const validResponse = {
  data: {
    id: "1234-1700000000-56789",
    reference: "LR7-ORDER-ABC123",
    status: "APPROVED",
    amount_in_cents: 11400000,
    currency: "COP",
    merchant: { id: "pub_test_merchant" },
  },
};

test("accepts a valid server-queried Wompi transaction from the configured merchant", () => {
  assert.deepEqual(parseWompiTransactionResponse(validResponse, "pub_test_merchant"), {
    id: "1234-1700000000-56789",
    reference: "LR7-ORDER-ABC123",
    status: "APPROVED",
    amountInCents: 11400000,
    currency: "COP",
    merchantId: "pub_test_merchant",
  });
});

test("accepts the documented GET shape without merchant and binds it to the authenticated private-key context", () => {
  const { merchant: _merchant, ...transaction } = validResponse.data;
  assert.equal(parseWompiTransactionResponse({ data: transaction }, "pub_test_merchant")?.merchantId, "pub_test_merchant");
});

test("rejects a transaction from another merchant or with an invalid amount/status", () => {
  assert.equal(parseWompiTransactionResponse(validResponse, "pub_prod_other"), null);
  assert.equal(parseWompiTransactionResponse({ data: { ...validResponse.data, amount_in_cents: -1 } }, "pub_test_merchant"), null);
  assert.equal(parseWompiTransactionResponse({ data: { ...validResponse.data, status: "REFUNDED" } }, "pub_test_merchant"), null);
  assert.equal(parseWompiTransactionResponse({ data: { ...validResponse.data, id: "https://attacker.test" } }, "pub_test_merchant"), null);
});
