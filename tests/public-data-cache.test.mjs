import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { CACHE_TAGS, PUBLIC_DATA_REVALIDATE_SECONDS } from "../lib/cache-tags.ts";

const read = (path) => readFileSync(path, "utf8");

// Si una lectura pública vuelve a usar el cliente con cookies, todo el sitio pasa a
// render dinámico (no-store) sin ningún error visible. Estos tests lo impiden.
test("public catalog and CMS reads never touch cookies", () => {
  for (const path of ["lib/catalog.ts", "lib/content.ts", "lib/supabase/public.ts", "app/layout.tsx"]) {
    const source = read(path);
    assert.equal(source.includes("@/lib/supabase/server"), false, `${path} no debe usar el cliente con cookies`);
    assert.equal(/\bcookies\(\)|\bheaders\(\)/.test(source), false, `${path} no debe leer cookies ni cabeceras`);
  }
});

test("public reads are cached with the shared tags", () => {
  assert.match(read("lib/catalog.ts"), /unstable_cache\([\s\S]*CACHE_TAGS\.catalog/);
  const content = read("lib/content.ts");
  assert.equal((content.match(/unstable_cache\(/g) ?? []).length, 4);
  assert.match(content, /tags: \[CACHE_TAGS\.content\]/);
  assert.ok(PUBLIC_DATA_REVALIDATE_SECONDS > 0 && PUBLIC_DATA_REVALIDATE_SECONDS <= 3600);
});

test("admin mutations expire both public data tags", () => {
  const actions = read("app/admin/actions.ts");
  const body = actions.slice(actions.indexOf("function revalidatePublicSite"), actions.indexOf("function productFields"));
  assert.match(body, /updateTag\(CACHE_TAGS\.catalog\)/);
  assert.match(body, /updateTag\(CACHE_TAGS\.content\)/);
  assert.deepEqual(Object.values(CACHE_TAGS).sort(), ["lr7:catalog", "lr7:content"]);
});
