import { createHash, timingSafeEqual } from "node:crypto";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function getOrderAccessCookieName(orderId: string) {
  return UUID_PATTERN.test(orderId) ? `lr7_order_${orderId}` : null;
}

export function hashOrderAccessToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function matchesOrderAccessToken(token: string, storedHash: string | null) {
  if (!storedHash || !/^[a-f0-9]{64}$/.test(storedHash)) return false;
  const tokenHash = Buffer.from(hashOrderAccessToken(token), "hex");
  const expectedHash = Buffer.from(storedHash, "hex");
  return tokenHash.length === expectedHash.length && timingSafeEqual(tokenHash, expectedHash);
}
