import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const css = readFileSync("app/globals.css", "utf8");
const root = css.slice(css.indexOf(":root"), css.indexOf("}", css.indexOf(":root")));
// Resuelve alias del tipo var(--otro-token) hasta llegar a un valor literal.
const token = (name, depth = 0) => {
  const match = root.match(new RegExp(`--${name}:\\s*([^;]+);`));
  assert.ok(match, `falta el token --${name}`);
  const value = match[1].trim();
  const alias = value.match(/^var\(--([\w-]+)\)$/);
  return alias && depth < 5 ? token(alias[1], depth + 1) : value;
};
const parse = (value) => {
  const hex = value.match(/^#([0-9a-f]{6})$/i);
  if (hex) return [...[0, 2, 4].map((i) => parseInt(hex[1].slice(i, i + 2), 16)), 1];
  const rgba = value.match(/rgba?\(([^)]+)\)/);
  const [r, g, b, a = "1"] = rgba[1].split(",").map((part) => part.trim());
  return [Number(r), Number(g), Number(b), Number(a)];
};
const blend = (fg, bg) => fg.slice(0, 3).map((c, i) => fg[3] * c + (1 - fg[3]) * bg[i]);
const luminance = (rgb) => {
  const [r, g, b] = rgb.map((c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (fgValue, bgValue) => {
  const bg = parse(bgValue); const fg = blend(parse(fgValue), bg);
  const [hi, lo] = [luminance(fg), luminance(bg.slice(0, 3))].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const AA = 4.5;

test("muted text tokens meet WCAG AA on the light and dark surfaces they are used on", () => {
  for (const surface of [token("color-white"), token("color-off-white")]) {
    assert.ok(contrast(token("color-text-muted"), surface) >= AA, `--color-text-muted sobre ${surface}`);
  }
  for (const surface of [token("color-mid"), "#0f0f0f", "#080a0d"]) {
    assert.ok(contrast(token("color-text-muted-on-dark"), surface) >= AA, `--color-text-muted-on-dark sobre ${surface}`);
    assert.ok(contrast(token("color-accent-on-dark"), surface) >= AA, `--color-accent-on-dark sobre ${surface}`);
    assert.ok(contrast(token("color-text-on-dark"), surface) >= AA);
  }
  // Paleta "El Dorsal, en silencio": acción, acero y grises de texto sobre sus superficies reales.
  for (const surface of [token("color-white"), token("color-gray-50")]) {
    assert.ok(contrast(token("color-action"), surface) >= AA, `--color-action sobre ${surface}`);
    assert.ok(contrast(token("color-gray-600"), surface) >= AA, `--color-gray-600 sobre ${surface}`);
    assert.ok(contrast(token("color-danger"), surface) >= AA, `--color-danger sobre ${surface}`);
  }
  assert.ok(contrast(token("color-white"), token("color-action")) >= AA, "texto blanco sobre el botón primario");
  assert.ok(contrast(token("color-white"), token("color-steel")) >= AA, "texto blanco sobre acero");
  // Bordes de controles (WCAG 1.4.11): gris 400 ≥ 3:1 sobre blanco.
  assert.ok(contrast(token("color-gray-400"), token("color-white")) >= 3, "borde de campo sobre blanco");
});

test("dark sections of the about page use the on-dark text tokens", () => {
  const about = readFileSync("app/nosotros/page.tsx", "utf8");
  assert.match(about, /minHeight: "80vh"[^}]*color: "var\(--color-text-on-dark\)"/);
  assert.match(about, /background: "#0f0f0f", color: "var\(--color-text-on-dark\)"/);
});

test("inputs keep a visible keyboard focus and the closed search is not focusable", () => {
  assert.doesNotMatch(readFileSync("app/contacto/page.tsx", "utf8"), /outline: "none"/);
  const navbar = readFileSync("components/layout/navbar.tsx", "utf8");
  assert.match(navbar, /id="site-search"\s+inert=\{!searchOpen\}/);
  assert.doesNotMatch(navbar.slice(navbar.indexOf("ref={searchInputRef}"), navbar.indexOf('aria-label="Buscar producto"')), /outline/);
  assert.match(css, /\.shop-search input:focus-visible \{/);
});
