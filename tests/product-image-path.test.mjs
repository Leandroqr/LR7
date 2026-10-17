import assert from "node:assert/strict";
import test from "node:test";
import { isRemoteProductImagePath, resolveProductImageUrl } from "../lib/admin/product-images.ts";

const storageUrl = (path) => `https://storage.example.test/products/${path}`;

test("uses seeded HTTP image URLs directly instead of treating them as bucket paths", () => {
  const imageUrl = "https://images.unsplash.com/photo-123?w=900&auto=format";
  assert.equal(isRemoteProductImagePath(imageUrl), true);
  assert.equal(resolveProductImageUrl(imageUrl, storageUrl), imageUrl);
});

test("resolves bucket-relative image paths through Supabase Storage", () => {
  assert.equal(isRemoteProductImagePath("product-id/image.webp"), false);
  assert.equal(resolveProductImageUrl("product-id/image.webp", storageUrl), "https://storage.example.test/products/product-id/image.webp");
  assert.equal(isRemoteProductImagePath("javascript:alert(1)"), false);
});
