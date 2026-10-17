import assert from "node:assert/strict";
import test from "node:test";
import { getProductImageExtension } from "../lib/validation/product-image.ts";

const signatures = {
  "image/jpeg": Uint8Array.from([0xff, 0xd8, 0xff, 0xe0]),
  "image/png": Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  "image/webp": Uint8Array.from([0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]),
  "image/avif": Uint8Array.from([0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x61, 0x76, 0x69, 0x66]),
};

test("accepts supported product image formats with matching file signatures", () => {
  assert.equal(getProductImageExtension("image/jpeg", 100, signatures["image/jpeg"]), "jpg");
  assert.equal(getProductImageExtension("image/png", 100, signatures["image/png"]), "png");
  assert.equal(getProductImageExtension("image/webp", 100, signatures["image/webp"]), "webp");
  assert.equal(getProductImageExtension("image/avif", 100, signatures["image/avif"]), "avif");
});

test("rejects unsupported, mismatched, empty, and oversized files", () => {
  assert.equal(getProductImageExtension("image/gif", 100, new Uint8Array(12)), null);
  assert.equal(getProductImageExtension("image/png", 100, signatures["image/jpeg"]), null);
  assert.equal(getProductImageExtension("image/png", 0, signatures["image/png"]), null);
  assert.equal(getProductImageExtension("image/png", 5 * 1024 * 1024 + 1, signatures["image/png"]), null);
});
