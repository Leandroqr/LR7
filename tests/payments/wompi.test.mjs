import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import {
  createWompiIntegritySignature,
  createWompiReference,
  shouldApplyWompiStatus,
  verifyWompiEventSignature,
} from "../../lib/payments/wompi-signatures.ts";

const checksumProperties = [
  "transaction.id",
  "transaction.status",
  "transaction.amount_in_cents",
];

function createSignedEvent(secret, checksumCase = "upper") {
  const event = {
    event: "transaction.updated",
    environment: "test",
    data: {
      transaction: {
        id: "txn-test-001",
        status: "APPROVED",
        amount_in_cents: 4490000,
      },
    },
    timestamp: 1530291411,
    signature: { properties: checksumProperties },
  };
  const values = [event.data.transaction.id, event.data.transaction.status, event.data.transaction.amount_in_cents];
  const checksum = createHash("sha256")
    .update(`${values.join("")}${event.timestamp}${secret}`)
    .digest("hex");
  event.signature.checksum = checksumCase === "upper" ? checksum.toUpperCase() : checksum;
  return event;
}

test("verifies uppercase Wompi event checksums", () => {
  const event = createSignedEvent("test_events_secret");
  assert.equal(verifyWompiEventSignature(event, event, "test_events_secret"), true);
});

test("rejects invalid checksums and malformed signature properties", () => {
  const invalidChecksum = createSignedEvent("test_events_secret");
  invalidChecksum.signature.checksum = "not-a-checksum";
  assert.equal(verifyWompiEventSignature(invalidChecksum, invalidChecksum, "test_events_secret"), false);

  const invalidProperty = createSignedEvent("test_events_secret");
  invalidProperty.signature.properties = ["transaction.__proto__"];
  assert.equal(verifyWompiEventSignature(invalidProperty, invalidProperty, "test_events_secret"), false);
});

test("accepts the documented checksum header when the body copy is absent and rejects disagreement", () => {
  const event = createSignedEvent("test_events_secret");
  const checksum = event.signature.checksum;
  delete event.signature.checksum;
  assert.equal(verifyWompiEventSignature(event, event, "test_events_secret", checksum), true);
  event.signature.checksum = checksum;
  assert.equal(verifyWompiEventSignature(event, event, "test_events_secret", "0".repeat(64)), false);
});

test("creates unique references with a 96-bit hexadecimal suffix", () => {
  const first = createWompiReference("LR7-20261016-000001");
  const second = createWompiReference("LR7-20261016-000001");
  assert.match(first, /^LR7-20261016-000001-[A-F0-9]{24}$/);
  assert.notEqual(first, second);
});

test("creates the integrity signature from reference, cents, currency, and secret", () => {
  const input = "ORDER-1-ABCD1250000COPtest_integrity_secret";
  const expected = createHash("sha256").update(input).digest("hex");
  assert.equal(
    createWompiIntegritySignature("ORDER-1-ABCD", 1250000, "COP", "test_integrity_secret"),
    expected,
  );
});

test("does not let stale events roll back terminal payment states", () => {
  assert.equal(shouldApplyWompiStatus("APPROVED", "PENDING"), false);
  assert.equal(shouldApplyWompiStatus("DECLINED", "PENDING"), false);
  assert.equal(shouldApplyWompiStatus("DECLINED", "ERROR"), false);
  assert.equal(shouldApplyWompiStatus("DECLINED", "DECLINED"), false);
  assert.equal(shouldApplyWompiStatus("APPROVED", "APPROVED"), false);
  assert.equal(shouldApplyWompiStatus("PENDING", "APPROVED"), true);
  assert.equal(shouldApplyWompiStatus("APPROVED", "VOIDED"), true);
  assert.equal(shouldApplyWompiStatus("VOIDED", "APPROVED"), false);
});