import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { LOCAL_SITE_URL, resolveSiteUrl } from "../lib/site-url.ts";

test("prefers the explicit public site URL and normalizes it to an origin", () => {
  assert.equal(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://www.lr7.co/", VERCEL_PROJECT_PRODUCTION_URL: "lr7.vercel.app" }), "https://www.lr7.co");
  assert.equal(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "  https://lr7.co/tienda?x=1  " }), "https://lr7.co");
});

test("falls back to the Vercel production domain, which has no protocol", () => {
  assert.equal(resolveSiteUrl({ VERCEL_PROJECT_PRODUCTION_URL: "lr7.vercel.app" }), "https://lr7.vercel.app");
  assert.equal(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "", VERCEL_PROJECT_PRODUCTION_URL: "lr7.vercel.app" }), "https://lr7.vercel.app");
});

test("ignores unusable values and ends at localhost outside Vercel", () => {
  assert.equal(resolveSiteUrl({}), LOCAL_SITE_URL);
  assert.equal(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "javascript:alert(1)", VERCEL_PROJECT_PRODUCTION_URL: "lr7.vercel.app" }), "https://lr7.vercel.app");
  assert.equal(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://user:pass@lr7.co" }), LOCAL_SITE_URL);
  assert.equal(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "ht tp://mal" }), LOCAL_SITE_URL);
});

test("no source file hardcodes a foreign site domain", () => {
  const roots = ["app", "components", "lib", "types", "next.config.ts"];
  const offenders = [];
  const walk = (path) => {
    if (statSync(path).isDirectory()) return readdirSync(path).forEach((entry) => walk(join(path, entry)));
    if (/\.(ts|tsx|mjs|js)$/.test(path) && /sportco\.co|futbolstreetwear\.com/.test(readFileSync(path, "utf8"))) offenders.push(path);
  };
  roots.forEach(walk);
  assert.deepEqual(offenders, []);
});
