import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const navbar = readFileSync("components/layout/navbar.tsx", "utf8");
const css = readFileSync("app/globals.css", "utf8");

test("main navigation: football-only scope, Training and Streetwear kept but filtered by configuration", () => {
  const links = [...navbar.matchAll(/\{ href: "([^"]+)", label: "([^"]+)" \}/g)].map((match) => `${match[1]} ${match[2]}`);
  assert.deepEqual(links, ["/tienda Tienda", "/categorias/futbol-clubes Clubes", "/categorias/futbol-selecciones Selecciones", "/categorias/futbol-retro Retro", "/personaliza Personaliza", "/training Training", "/streetwear Streetwear"]);
  // Todos los enlaces (fijos o del CMS) pasan por canLink: secciones ocultas y categorías vacías no se muestran.
  assert.match(navbar, /\(navigation\.length \? navigation : NAV_LINKS\)\.filter\(\(link\) => canLink\(link\.href\)\)/);
  const code = navbar.replace(/\/\/.*$/gm, "").replace(/\{\/\*[\s\S]*?\*\/\}/g, "");
  assert.doesNotMatch(code, /CATÁLOGO|"STREET"|INICIO/);
});

test("header marks the current page, keeps 44px targets and has no inline styles", () => {
  assert.match(navbar, /aria-current=\{active \? "page" : undefined\}/);
  assert.doesNotMatch(navbar, /style=\{\{/);
  assert.match(css, /\.site-header-icon \{[^}]*width: 44px;[^}]*height: 44px;/);
  // Contador: blanco sobre el azul de acción (antes texto oscuro a 3,3:1).
  assert.match(css, /\.site-header-count \{[^}]*background: var\(--color-action\);[^}]*color: var\(--color-white\);/);
});

test("mobile menu stays out of the tab order when closed and keeps focus management", () => {
  assert.match(navbar, /aria-hidden=\{!menuOpen\}\s+inert=\{!menuOpen\}/);
  // Tocar el fondo de la hoja la cierra.
  assert.match(navbar, /event\.target === event\.currentTarget\) setMenuOpen\(false\)/);
  assert.match(navbar, /event\.key === "Escape"/);
  assert.match(navbar, /aria-label=\{menuOpen \? "Cerrar menú" : "Abrir menú"\}/);
});
