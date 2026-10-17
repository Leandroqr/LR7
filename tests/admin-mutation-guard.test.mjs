import assert from "node:assert/strict";
import test from "node:test";
import { assertAdminMutationAllowed } from "../lib/auth/admin-mutation-guard.ts";

test("rejects all mutations in read-only admin preview", () => {
  assert.throws(() => assertAdminMutationAllowed(true), /solo lectura/i);
});

test("allows mutation guard for an authenticated non-preview admin session", () => {
  assert.doesNotThrow(() => assertAdminMutationAllowed(false));
});