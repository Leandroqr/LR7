import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("commercial scope: football only by default; Training and Streetwear hidden but recoverable by configuration", async () => {
  const scope = await import("../lib/store-scope.ts");
  assert.deepEqual([...scope.ACTIVE_LINES], ["FUTBOL"]);
  assert.equal(scope.STREETWEAR_ENABLED, false);
  assert.equal(scope.isPublicHrefEnabled("/training"), false);
  assert.equal(scope.isPublicHrefEnabled("/training?cat=TRAINING_BUZOS"), false);
  assert.equal(scope.isPublicHrefEnabled("/tienda?brand=TRAINING"), false);
  assert.equal(scope.isPublicHrefEnabled("/streetwear"), false);
  assert.equal(scope.isPublicHrefEnabled("/tienda"), true);
  assert.equal(scope.isPublicHrefEnabled("/categorias/futbol-retro"), true);
  const products = [{ brand: "FUTBOL", id: 1 }, { brand: "TRAINING", id: 2 }];
  assert.deepEqual(scope.filterActiveProducts(products).map((product) => product.id), [1]);
  // Las rutas y componentes se conservan: solo responden 404 mientras la línea esté oculta.
  assert.match(readFileSync("app/training/page.tsx", "utf8"), /if \(!isLineActive\("TRAINING"\)\) notFound\(\);/);
  assert.match(readFileSync("app/streetwear/page.tsx", "utf8"), /if \(!STREETWEAR_ENABLED\) notFound\(\);/);
  assert.match(readFileSync("lib/catalog.ts", "utf8"), /return filterActiveProducts\(await loadPublicProducts\(\)\);/);
  assert.match(readFileSync("app/categorias/[slug]/page.tsx", "utf8"), /if \(!products\.length\) notFound\(\);/);
});

test("legal documents come from the CMS and are never linked or shown while empty", async () => {
  const { LEGAL_PAGES, SIC_URL, legalHref } = await import("../lib/legal-pages.ts");
  assert.deepEqual(LEGAL_PAGES.map((page) => page.slug), ["terminos-y-condiciones", "tratamiento-de-datos", "aviso-de-privacidad", "derecho-de-retracto", "reversion-del-pago", "pqr"]);
  assert.equal(new Set(LEGAL_PAGES.map((page) => page.pageKey)).size, LEGAL_PAGES.length);
  assert.equal(legalHref(LEGAL_PAGES[0]), "/legal/terminos-y-condiciones");
  assert.equal(SIC_URL, "https://www.sic.gov.co/");
  const route = readFileSync("app/legal/[slug]/page.tsx", "utf8");
  assert.match(route, /if \(!sections\.length\) notFound\(\);/);
  const footer = readFileSync("components/layout/footer.tsx", "utf8");
  assert.match(footer, /href=\{SIC_URL\}/, "enlace funcional a la SIC, no solo un logo");
  assert.match(footer, /legalPages\.filter/, "solo documentos publicados");
});

test("WhatsApp: contextual messages, no number invented, no link when it is not configured", async () => {
  const { getGeneralWhatsAppMessage, getProductWhatsAppMessage } = await import("../lib/whatsapp.ts");
  assert.equal(getGeneralWhatsAppMessage("/checkout/estado/abc-123"), "Hola LR7, tengo una consulta sobre mi pedido abc-123.");
  assert.equal(getGeneralWhatsAppMessage("/checkout/estado/<script>"), "Hola LR7, ¿me pueden ayudar con una consulta?");
  assert.match(getProductWhatsAppMessage({ product: { name: "Selección Colombia" }, productUrl: "https://lr7.example/productos/x" }), /Selección Colombia/);
  // lib/site.ts importa ./site-url sin extensión (no se resuelve con strip-types): se comprueba su código.
  const site = readFileSync("lib/site.ts", "utf8");
  assert.match(site, /if \(!isWhatsAppConfigured\(\)\) return null;/, "sin número no hay enlace");
  assert.match(site, /=> link\.url !== null\);/, "sin URL no hay enlace social");
  assert.match(site, /hosts\.includes\(url\.hostname\)/, "solo perfiles del dominio de cada red");
  assert.match(site, /process\.env\.NEXT_PUBLIC_PAYMENT_METHODS \?\? ""/, "sin configuración, ningún medio de pago");
  assert.match(readFileSync("components/commerce/whatsapp-link.tsx", "utf8"), /if \(!whatsappUrl\) return null;/);
  const env = readFileSync(".env.example", "utf8");
  for (const key of ["NEXT_PUBLIC_STORE_LINES", "NEXT_PUBLIC_STREETWEAR_ENABLED", "NEXT_PUBLIC_INSTAGRAM_URL", "NEXT_PUBLIC_TIKTOK_URL", "NEXT_PUBLIC_PAYMENT_METHODS"]) {
    assert.match(env, new RegExp(`^${key}=$`, "m"), `${key} documentada y vacía`);
  }
  const float = readFileSync("components/layout/whatsapp-float.tsx", "utf8");
  assert.doesNotMatch(float, /PRODUCTS|whatsapp-float-attention/, "usa el catálogo real y sin el punto naranja");
});
