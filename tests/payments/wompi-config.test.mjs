import assert from "node:assert/strict";
import test from "node:test";
import { parseWompiConfig } from "../../lib/payments/wompi-config.ts";

const sandbox = {
  WOMPI_PUBLIC_KEY: "pub_test_public",
  WOMPI_PRIVATE_KEY: "prv_test_private",
  WOMPI_INTEGRITY_SECRET: "test_integrity_secret",
  WOMPI_EVENTS_SECRET: "test_events_secret",
};

test("loads sandbox only when all keys match the sandbox environment", () => {
  const config = parseWompiConfig("sandbox", sandbox);
  assert.equal(config?.apiBaseUrl, "https://sandbox.wompi.co/v1");
  assert.equal(config?.environment, "sandbox");
  assert.equal(parseWompiConfig("sandbox", { ...sandbox, WOMPI_PRIVATE_KEY: "prv_prod_private" }), null);
  assert.equal(parseWompiConfig("production", sandbox), null);
});

test("loads production only when all keys match the production environment", () => {
  const config = parseWompiConfig("production", {
    WOMPI_PUBLIC_KEY: "pub_prod_public",
    WOMPI_PRIVATE_KEY: "prv_prod_private",
    WOMPI_INTEGRITY_SECRET: "prod_integrity_secret",
    WOMPI_EVENTS_SECRET: "prod_events_secret",
  });
  assert.equal(config?.apiBaseUrl, "https://production.wompi.co/v1");
});

test("fails closed for missing, placeholder, or unknown environment values", () => {
  assert.equal(parseWompiConfig("sandbox", { ...sandbox, WOMPI_EVENTS_SECRET: "" }), null);
  assert.equal(parseWompiConfig("sandbox", { ...sandbox, WOMPI_PUBLIC_KEY: "pub_test_..." }), null);
  assert.equal(parseWompiConfig("staging", sandbox), null);
});
