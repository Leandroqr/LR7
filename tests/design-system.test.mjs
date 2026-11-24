import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const css = readFileSync("app/globals.css", "utf8");
const root = css.slice(css.indexOf(":root"), css.indexOf("}", css.indexOf(":root")));
const value = (name) => root.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1].trim();

test("the owner's palette is defined and blue is the only action color", () => {
  assert.equal(value("color-night"), "#071426");
  assert.equal(value("color-navy"), "#0D1F38");
  assert.equal(value("color-steel"), "#174A7E");
  assert.equal(value("color-action"), "#1152E8");
  // El naranja se elimina: los tokens heredados apuntan al azul de acción.
  assert.equal(value("color-accent-orange"), "var(--color-action)");
  assert.equal(value("color-accent-orange-hover"), "var(--color-action-hover)");
  assert.equal(value("color-accent-orange-text"), "var(--color-action)");
});

test("no orange literal remains in the storefront", () => {
  const ORANGE = /#ff6a00|#d95700|#a83f00|#9e3600|#fff7f2|255,\s*106,\s*0/i;
  const offenders = [];
  const walk = (dir) => readdirSync(dir).forEach((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return path.includes("admin") ? undefined : walk(path);
    if (/\.tsx?$/.test(path) && ORANGE.test(readFileSync(path, "utf8"))) offenders.push(path);
  });
  ["app", "components"].forEach(walk);
  assert.deepEqual(offenders, []);
  const storefrontCss = css.slice(0, css.indexOf("/* Admin */")) + css.slice(css.indexOf("/* Admin */")).replace(/\.admin[^{]*\{[^}]*\}/g, "");
  assert.doesNotMatch(storefrontCss.replace(/--color-accent-orange[\w-]*:[^;]+;/g, ""), ORANGE);
});

test("closed type scale never goes below 12px and motion tokens exist", () => {
  for (const name of ["text-caption", "text-body-sm", "text-body", "text-label", "text-title"]) {
    const rem = Number.parseFloat(value(name));
    assert.ok(rem >= 0.75, `--${name} = ${value(name)} está por debajo de 12 px`);
  }
  assert.match(value("text-display"), /^clamp\(/);
  assert.equal(value("ease-out"), "cubic-bezier(0.23, 1, 0.32, 1)");
  for (const name of ["duration-press", "duration-state", "duration-drawer"]) assert.match(value(name), /^\d+ms$/);
});

test("base buttons only hover with a fine pointer and give press feedback", () => {
  assert.match(css, /@media \(hover: hover\) and \(pointer: fine\) \{\s*\.btn-primary:hover/);
  assert.match(css, /\.btn-primary:active:not\(:disabled\),\s*\.btn-outline:active:not\(:disabled\) \{\s*transform: scale\(0\.97\)/);
  assert.doesNotMatch(css.slice(css.indexOf(".btn-primary {"), css.indexOf(".btn-outline {")), /transition: all/);
});

test("ui primitives exist and the icon button requires an accessible label", () => {
  for (const file of ["button", "icon-button", "badge", "field", "price"]) assert.ok(statSync(`components/ui/${file}.tsx`).isFile());
  assert.match(readFileSync("components/ui/icon-button.tsx", "utf8"), /label: string/);
});

test("Tailwind theme mirrors the :root tokens and skips preflight (T0)", () => {
  const entry = readFileSync("app/styles.css", "utf8");
  assert.match(entry, /@layer theme, legacy, utilities;/);
  assert.match(entry, /@import "\.\/globals\.css" layer\(legacy\);/);
  assert.doesNotMatch(entry, /@import "tailwindcss(\/preflight\.css)?"/);
  const theme = entry.slice(entry.indexOf("@theme"), entry.lastIndexOf("}"));
  const pairs = [...theme.matchAll(/--([\w-]+):\s*([^;]+);/g)].filter(([, name]) => !name.endsWith("*"));
  let shared = 0;
  for (const [, name, themeValue] of pairs) {
    const rootValue = value(name);
    if (rootValue === undefined) continue;
    shared += 1;
    assert.equal(themeValue.trim(), rootValue, `--${name} difiere entre @theme y :root`);
  }
  assert.ok(shared >= 25, `solo ${shared} tokens compartidos`);
});
