import assert from "node:assert/strict";
import test from "node:test";
import { serializeJsonLd } from "../lib/seo.ts";

test("escapes script-closing characters in structured data", () => {
  const serialized = serializeJsonLd({ name: "shirt </script><script>alert(1)</script>" });
  assert.equal(serialized.includes("<"), false);
  assert.equal(serialized.includes("\\u003c/script>"), true);
});