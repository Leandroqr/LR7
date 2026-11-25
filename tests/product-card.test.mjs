import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { isStockImage, jerseyNumberFor, jerseyPaletteFor } from "../lib/product-visual.ts";

test("stock photos are replaced by the render; admin uploads are shown", () => {
  assert.equal(isStockImage("https://images.unsplash.com/photo-1?w=900"), true);
  assert.equal(isStockImage(""), true);
  assert.equal(isStockImage(undefined), true);
  assert.equal(isStockImage("https://abc.supabase.co/storage/v1/object/public/products/x.webp"), false);
});

test("render number comes from the product name, with a sensible default", () => {
  assert.equal(jerseyNumberFor({ name: "Vintage Brasil 82", brand: "FUTBOL" }), "82");
  assert.equal(jerseyNumberFor({ name: "Nacional 2024", brand: "FUTBOL" }), "24");
  assert.equal(jerseyNumberFor({ name: "Selección Colombia", brand: "FUTBOL" }), "10");
  assert.equal(jerseyNumberFor({ name: "Camisilla Training Premium", brand: "TRAINING" }), "7");
});

test("render palette is stable per product", () => {
  const product = { slug: "seleccion-colombia", brand: "FUTBOL" };
  assert.equal(jerseyPaletteFor(product), jerseyPaletteFor({ ...product }));
  assert.ok(["steel", "night", "chalk"].includes(jerseyPaletteFor({ slug: "buzo", brand: "TRAINING" })));
});

test("the product card links to the product page and carries no size picker or quick add", () => {
  const source = readFileSync("components/product/product-card.tsx", "utf8");
  assert.match(source, /href=\{`\/productos\/\$\{product\.slug\}`\}/);
  assert.doesNotMatch(source, /addToCart|ELIGE TALLA|shop-quick/);
  assert.doesNotMatch(source, /aria-hidden="true">→/);
});

test("listing pages share the product grid instead of inline grids", () => {
  for (const path of ["app/buscar/page.tsx", "components/pages/favorites-list.tsx", "app/categorias/[slug]/page.tsx", "components/pages/catalog-page.tsx", "components/pages/shop-page.tsx"]) {
    const source = readFileSync(path, "utf8");
    assert.match(source, /className="product-grid"/, path);
    assert.doesNotMatch(source, /gap: "2px"/, path);
  }
});

test("the shop never shows the internal motto or stock hero photo", () => {
  const source = readFileSync("components/pages/shop-page.tsx", "utf8");
  assert.doesNotMatch(source, /FOOTBALL FIRST|BUILT FOR THE GAME|unsplash/i);
});

test("favorites page reads the public catalog, not the fallback one (LR7-061)", () => {
  const page = readFileSync("app/favoritos/page.tsx", "utf8");
  assert.match(page, /getPublicProducts\(\)/);
  assert.doesNotMatch(page, /PRODUCTS|"use client"/);
  const list = readFileSync("components/pages/favorites-list.tsx", "utf8");
  assert.doesNotMatch(list, /from "@\/lib\/products"/);
});

test("product page: photo gallery, live dorsal next to the fields and the no-exchange notice", () => {
  const source = readFileSync("components/pages/product-page.tsx", "utf8");
  assert.match(source, /const galleryImages = product\.images\.filter/);
  assert.match(source, /className="product-customization-preview"[\s\S]*<DorsalJersey name=\{renderName\}/);
  assert.match(source, /sanitizeDorsalName\(event\.target\.value, nameMaxLength\)/);
  assert.match(source, /Las camisetas personalizadas no tienen cambio, salvo defecto de fábrica\./);
  assert.doesNotMatch(source, /product-eyebrow|TAMBIÉN TE PUEDE GUSTAR|JerseySVG|aria-hidden="true">→|>×</);
  // La compra no cambia: talla obligatoria, carrito y comprar ahora.
  assert.match(source, /if \(!requireSize\(\) \|\| !selectedVariant\) return;\n    addToCart\(selectedCartItem, \{ notify: true \}\);/);
  assert.match(source, /router\.push\("\/carrito"\)/);
});

test("card shows the product photo and swaps to its real second photo only on hover", () => {
  const card = readFileSync("components/product/product-card.tsx", "utf8");
  assert.match(card, /product\.hoverImage\.src !== product\.images\[0\]\?\.src/);
  const visual = readFileSync("components/product/product-visual.tsx", "utf8");
  assert.match(visual, /if \(image\?\.src\)/);
});

test("cart and mini-cart use the product render, with the customer's dorsal when personalized (UX7)", () => {
  for (const path of ["app/carrito/page.tsx", "components/commerce/mini-cart.tsx"]) {
    const source = readFileSync(path, "utf8");
    assert.match(source, /<ProductVisual/, path);
    assert.match(source, /dorsal=\{\{ name: item\.customName, number: item\.customNumber \}\}/, path);
    assert.doesNotMatch(source, /images\[0\]\.src|cart-eyebrow|aria-hidden="true">→|>×</, path);
  }
  const cart = readFileSync("app/carrito/page.tsx", "utf8");
  assert.doesNotMatch(cart, /\{item\.product\.brand\} · /);
  assert.match(cart, /<CheckoutPanel cart=\{currentCart\} \/>/);
});

test("order and payment statuses show in Spanish; unknown codes stay readable (UX7b)", async () => {
  const { getOrderStatusLabel, getPaymentStatusLabel } = await import("../lib/order-labels.ts");
  assert.equal(getOrderStatusLabel("payment_pending"), "Verificando el pago");
  assert.equal(getOrderStatusLabel("paid"), "Pagado");
  assert.equal(getOrderStatusLabel("on_hold"), "On hold");
  assert.equal(getPaymentStatusLabel("APPROVED"), "Aprobado");
  assert.equal(getPaymentStatusLabel(""), "Sin estado");
});

test("checkout form keeps every field name and constraint (presentation-only change)", () => {
  const source = readFileSync("components/commerce/checkout-panel.tsx", "utf8");
  for (const field of [
    'name="full_name" autoComplete="name" minLength={2} maxLength={160} required',
    'name="email" type="email" autoComplete="email" maxLength={254} required',
    'name="phone" type="tel" inputMode="tel" autoComplete="tel" minLength={10} maxLength={16}',
    'name="address_line_1" autoComplete="address-line1" minLength={5} maxLength={180} required',
    'name="address_line_2" autoComplete="address-line2" maxLength={180}',
    'name="city" autoComplete="address-level2" minLength={2} maxLength={100} required',
    'name="region" autoComplete="address-level1" minLength={2} maxLength={100} required',
    'name="postal_code" autoComplete="postal-code" maxLength={20}',
    'name="coupon_code" autoComplete="off" maxLength={80}',
  ]) assert.ok(source.includes(field), field);
  assert.match(source, /fetch\("\/api\/payments\/wompi\/prepare"/);
});

test("card motion (M3): hover on the whole card, discreet favorite only with a pointer, reduced motion keeps fades", () => {
  const css = readFileSync("app/globals.css", "utf8");
  const pointer = css.slice(css.indexOf("/* Hover en toda la tarjeta"), css.indexOf("/* Movimiento reducido: la tarjeta"));
  // Pasar sobre el corazón (hermano del enlace) no debe devolver la foto principal.
  assert.match(pointer, /\.pcard:hover img\.pcard-hover-image/);
  assert.doesNotMatch(pointer, /\.pcard-link:hover/);
  // El favorito sin marcar solo se oculta dentro del bloque con puntero, y vuelve con hover o foco de teclado.
  assert.match(pointer, /\.pcard-favorite:not\(\.is-active\) \{\s*opacity: 0;/);
  assert.match(pointer, /\.pcard:focus-within \.pcard-favorite/);
  assert.ok(css.indexOf("@media (hover: hover) and (pointer: fine) {\n  /* Hover en toda la tarjeta") !== -1, "el ocultado vive en el bloque de puntero fino");
  assert.match(css, /prefers-reduced-motion: reduce\) \{\s*\.pcard-media,\s*\.pcard-media \.pcard-visual,\s*\.pcard-favorite \{ transform: none !important; \}/);
});

test("product gallery (M4): native swipe on mobile, crossfade + zoom on desktop, guarded by reduced motion", () => {
  const gallery = readFileSync("components/product/product-gallery.tsx", "utf8");
  const css = readFileSync("app/globals.css", "utf8");
  assert.match(gallery, /snap-x snap-mandatory overflow-x-auto/);
  assert.match(gallery, /prefers-reduced-motion: no-preference/, "el zoom no se activa con movimiento reducido");
  assert.match(gallery, /tabIndex=\{scrollable \? 0 : undefined\}/, "el carril móvil se puede mover con teclado");
  assert.match(gallery, /aria-pressed=\{active === index\}/);
  // La foto que sale sigue debajo hasta que la nueva termina de entrar (sin flash gris).
  assert.match(css, /\.product-gallery-slide \{ opacity: 0; visibility: hidden; transition: opacity 0s linear 160ms, visibility 0s linear 160ms; \}/);
  const page = readFileSync("components/pages/product-page.tsx", "utf8");
  assert.match(page, /<ProductGallery images=\{galleryImages\}/);
});

test("microinteractions (M5): animated exits without touching cart or filter logic", () => {
  const css = readFileSync("app/globals.css", "utf8");
  const shop = readFileSync("components/pages/shop-page.tsx", "utf8");
  const cart = readFileSync("app/carrito/page.tsx", "utf8");
  // Mini-carrito: sale con transición discreta (sigue en pantalla mientras sale).
  assert.match(css, /\.mini-cart \{\s*transform: translateX\(100%\);\s*transition: transform var\(--duration-state\)[^;]*overlay var\(--duration-state\) allow-discrete, display var\(--duration-state\) allow-discrete;/);
  // Filtros: todas las salidas pasan por closeFilters; con movimiento reducido se cierra al instante.
  assert.doesNotMatch(shop, /onClick=\{\(\) => setFiltersOpen\(false\)\}/);
  assert.match(shop, /prefers-reduced-motion: reduce\)"\)\.matches\) setFiltersOpen\(false\)/);
  // Deshacer también con el carrito vacío (al eliminar la única línea).
  assert.equal((cart.match(/\{undoNotice\}/g) ?? []).length, 2);
  assert.match(css, /\.cart-undo button \{ min-height: 44px;/);
});

test("mobile (M6): hover only with a fine pointer, streetwear tape pauses offscreen, 44 px touch targets", () => {
  const css = readFileSync("app/globals.css", "utf8");
  // Recorrido de llaves (sin dependencias): cada bloque guarda su prelude; un selector con :hover debe tener
  // un antecesor @media (hover: hover).
  const source = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const stack = [];
  const ungated = [];
  let start = 0;
  for (let i = 0; i < source.length; i++) {
    const ch = source[i];
    if (ch === "{") {
      const prelude = source.slice(start, i).trim();
      if (prelude.includes(":hover") && !prelude.startsWith("@") && !prelude.includes(".admin-") && !stack.some((p) => /^@media[^{]*hover:\s*hover/.test(p))) ungated.push(prelude);
      stack.push(prelude);
      start = i + 1;
    } else if (ch === "}") {
      stack.pop();
      start = i + 1;
    } else if (ch === ";" ) {
      start = i + 1;
    }
  }
  assert.deepEqual(ungated, [], "toda regla :hover de la tienda vive dentro de @media (hover: hover) and (pointer: fine)");
  const street = readFileSync("components/pages/streetwear-page.tsx", "utf8");
  // UX8: la cinta pasó a ser fija (DESIGN.md prohíbe el texto en movimiento) y no hay aparición por secciones.
  assert.doesNotMatch(street, /data-street-reveal|IntersectionObserver/);
  assert.doesNotMatch(css, /@keyframes street-tape|street-motion-ready/);
  assert.match(css, /\.site-header-logo,\n\.checkout-brand \{ display: inline-flex; align-items: center; min-width: 44px; min-height: 44px; \}/);
  assert.match(css, /\.product-customization-toggle::before \{ content: ""; position: absolute; inset: -6px 0; \}/);
});

test("motion validation (M7): filter sheet anchored to the bottom of the screen, reduced motion without scale", () => {
  const css = readFileSync("app/globals.css", "utf8");
  const drawer = css.slice(css.indexOf(".shop-filter-drawer {"), css.indexOf("}", css.indexOf(".shop-filter-drawer {")));
  assert.match(drawer, /position: fixed;/, "un modal con absolute se coloca respecto al documento y el foco desplaza la página");
  assert.match(drawer, /top: auto;/, "sin anular el top: 0 de los modales el panel queda arriba");
  assert.match(drawer, /bottom: 0;/);
  const reduced = css.slice(css.indexOf("/* ===== Validación del movimiento (M7)"));
  for (const sel of [".site-header-icon:active", ".favorite-button:active", ".size-btn:active", ".pcard-link:active .pcard-media"]) assert.ok(reduced.includes(sel), sel);
  assert.match(reduced, /\.product-customization-toggle span \{ transition: none; \}/);
  for (const file of ["components/pages/home-hero.tsx", "components/pages/home-teams.tsx"]) assert.doesNotMatch(readFileSync(file, "utf8"), /(?<!motion-safe:)active:scale/);
});

test("secondary pages (UX8): Spanish, no section reveals or added arrows, no labels over titles, honest footer", () => {
  const street = readFileSync("components/pages/streetwear-page.tsx", "utf8");
  const collections = readFileSync("components/pages/collections-page.tsx", "utf8");
  for (const [name, source] of [["streetwear", street], ["colecciones", collections]]) {
    const visible = source.replace(/\/\/.*$/gm, "").replace(/className="[^"]*"/g, "").replace(/(src|alt|href|id|aria-labelledby)=["{][^"}]*["}]/g, "");
    assert.doesNotMatch(visible, /\b(THE|NEW ARRIVALS|DROP \/|SHOP ALL|FOOTBALL|FASHION|WEAR THE|STYLE NOTE|BUILT FOR|READY FOR|EXPLORE|CURATED|JUST DROPPED|ARCHIVE|PERFORMANCE|ESSENTIALS|HOME<)\b/, `${name}: textos en inglés`);
    assert.doesNotMatch(source, /data-(street|collections)-reveal|IntersectionObserver/, `${name}: aparición por secciones`);
    assert.doesNotMatch(source, /[→↗↓]/, `${name}: flechas añadidas al texto`);
  }
  assert.doesNotMatch(street, /escudos/, "sin escudos de terceros (PRODUCT.md)");
  for (const page of ["app/envios/page.tsx", "app/cambios-y-devoluciones/page.tsx", "app/preguntas-frecuentes/page.tsx", "app/guia-de-tallas/page.tsx", "app/contacto/page.tsx", "app/not-found.tsx", "app/nosotros/page.tsx"]) {
    const source = readFileSync(page, "utf8");
    assert.doesNotMatch(source, /label="—|[—-] (INFORMACIÓN|AYUDA|GUÍA|CONTACTO|ERROR|NUESTRA)/, `${page}: etiqueta sobre el título`);
    assert.doesNotMatch(source, /style=\{\{/, `${page}: estilos en línea`);
  }
  const faq = readFileSync("components/pages/faq-list.tsx", "utf8");
  assert.match(faq, /<details/);
  assert.doesNotMatch(faq, /maxHeight|"#fff"/);
  const footer = readFileSync("components/layout/footer.tsx", "utf8");
  const fixed = footer.slice(footer.indexOf("const SHOP_LINKS"), footer.indexOf("// Documentos que van"));
  const hrefs = [...fixed.matchAll(/href: "([^"]+)"/g)].map((match) => match[1]);
  assert.equal(hrefs.length, new Set(hrefs).size, "el pie no repite enlaces");
  assert.match(footer, /export function mergeFooterLinks/);
  assert.doesNotMatch(footer, /NIT|Visa|Mastercard/, "sin datos legales ni medios de pago escritos a mano");
});
