import assert from "node:assert/strict";
import test from "node:test";
import { requestWompiTransaction, WompiApiError } from "../../lib/payments/wompi-api-request.ts";

const config = { environment: "sandbox", privateKey: "prv_test_not-a-real-key" };

test("queries only the fixed Sandbox host with server-side Bearer authentication", async () => {
  let captured;
  const payload = { data: { id: "txn-test-1" } };
  const response = await requestWompiTransaction(config, "txn-test-1", async (url, init) => {
    captured = { url: String(url), init };
    return new Response(JSON.stringify(payload), { status: 200, headers: { "content-type": "application/json" } });
  });
  assert.deepEqual(response, payload);
  assert.equal(captured.url, "https://sandbox.wompi.co/v1/transactions/txn-test-1");
  assert.equal(captured.init.method, "GET");
  assert.equal(captured.init.headers.authorization, "Bearer prv_test_not-a-real-key");
});

test("rejects path injection and does not include credentials in provider errors", async () => {
  await assert.rejects(requestWompiTransaction(config, "https://attacker.test"), (error) => error instanceof WompiApiError && error.status === 400);
  await assert.rejects(requestWompiTransaction(config, "txn-test-2", async () => new Response("secret-provider-body", { status: 401 })), (error) => {
    assert.equal(error instanceof WompiApiError, true);
    assert.equal(error.status, 401);
    assert.equal(error.message.includes("secret-provider-body"), false);
    assert.equal(error.message.includes(config.privateKey), false);
    return true;
  });
});
