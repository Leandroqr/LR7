import assert from "node:assert/strict";
import test from "node:test";
import { parseWompiTransactionEvent } from "../../lib/payments/wompi-events.ts";

const baseEvent = {
  event: "transaction.updated",
  environment: "test",
  timestamp: 1700000000,
  data: { transaction: { id: "txn-1", reference: "LR7-1-ABC", status: "APPROVED", amount_in_cents: 11400000, currency: "COP", merchant: { id: "pub_test_1" } } },
};

test("parses only supported COP transaction events from the configured merchant", () => {
  const parsed = parseWompiTransactionEvent(baseEvent, "pub_test_1");
  assert.equal(parsed.kind, "transaction");
  assert.equal(parsed.transaction.amountInCents, 11400000);
  assert.equal(parseWompiTransactionEvent({ ...baseEvent, event: "unknown.event" }, "pub_test_1").kind, "ignored");
  assert.equal(parseWompiTransactionEvent({ ...baseEvent, data: { transaction: { ...baseEvent.data.transaction, merchant: { id: "other" } } } }, "pub_test_1").kind, "invalid");
});

test("rejects missing IDs, unknown status, non-COP or non-positive amounts", () => {
  assert.equal(parseWompiTransactionEvent({ ...baseEvent, data: { transaction: { ...baseEvent.data.transaction, id: "https://evil.test" } } }, "pub_test_1").kind, "invalid");
  assert.equal(parseWompiTransactionEvent({ ...baseEvent, data: { transaction: { ...baseEvent.data.transaction, status: "REFUNDED" } } }, "pub_test_1").kind, "invalid");
  assert.equal(parseWompiTransactionEvent({ ...baseEvent, data: { transaction: { ...baseEvent.data.transaction, amount_in_cents: 0 } } }, "pub_test_1").kind, "invalid");
  assert.equal(parseWompiTransactionEvent({ ...baseEvent, data: { transaction: { ...baseEvent.data.transaction, currency: "USD" } } }, "pub_test_1").kind, "invalid");
});
