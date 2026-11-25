import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { DORSAL_NAME_MAX, personalizeHref, sanitizeDorsalName, sanitizeDorsalNumber } from "../lib/dorsal.ts";

const hero = readFileSync("components/pages/home-hero.tsx", "utf8");
const teams = readFileSync("components/pages/home-teams.tsx", "utf8");
const styles = readFileSync("app/styles.css", "utf8");
const home = readFileSync("components/pages/home-page.tsx", "utf8");
const personaliza = readFileSync("app/personaliza/page.tsx", "utf8");
const studio = readFileSync("components/pages/personalization-studio.tsx", "utf8");
const css = readFileSync("app/globals.css", "utf8");

test("dorsal name keeps uppercase letters, accents and single spaces within the limit", () => {
  assert.equal(sanitizeDorsalName("rincón  7!"), "RINCÓN ");
  assert.equal(sanitizeDorsalName("<script>"), "SCRIPT");
  assert.equal(sanitizeDorsalName("a".repeat(30)).length, DORSAL_NAME_MAX);
  assert.equal(sanitizeDorsalName(undefined), "");
});

test("dorsal number keeps at most two digits", () => {
  assert.equal(sanitizeDorsalNumber("1a0"), "10");
  assert.equal(sanitizeDorsalNumber("123"), "12");
  assert.equal(sanitizeDorsalNumber(null), "");
});

test("personalize link carries only non-empty, sanitized values", () => {
  assert.equal(personalizeHref("", ""), "/personaliza");
  assert.equal(personalizeHref("  gómez ", "9"), "/personaliza?nombre=G%C3%93MEZ&numero=9");
  assert.equal(personalizeHref("x", "", "retro-82"), "/personaliza?producto=retro-82&nombre=X");
});

test("search by team sits right below the hero, built only from real catalog teams, without crests", async () => {
  assert.match(home, /<HomeHero[\s\S]*<HomeTeams products=\{products\} \/>/);
  assert.doesNotMatch(home, /HeroCarousel|BenefitsStrip|NewDropSection|HomeDorsal/);
  assert.match(teams, /href=\{`\/buscar\?q=\$\{encodeURIComponent\(team\.name\)\}`\}/);
  assert.match(teams, /if \(product\.brand !== "FUTBOL"\) continue;/);
  assert.doesNotMatch(teams, /escudo\.|crest|logo\.(png|svg)/i);
});

test("/personaliza reads nombre and numero through the shared sanitizers", () => {
  assert.match(personaliza, /sanitizeDorsalName\(/);
  assert.match(personaliza, /sanitizeDorsalNumber\(/);
  assert.match(studio, /useState\(initialName\.slice\(0, initialSettings\.nameMaxLength\)\)/);
});

test("hero carousel: CMS slides or real products, accessible controls, no timers, motion only when allowed", () => {
  assert.match(hero, /HERO_PHOTO_ID = "photo-1516948900-c5137d2bf399"/);
  // Las diapositivas del CMS que enlazan a secciones ocultas (alcance comercial) se descartan.
  assert.match(hero, /\(cmsSlides \?\? \[\]\)\.filter\(\(slide\) => isPublicHrefEnabled\(slide\.cta_href\)\)/);
  assert.match(hero, /visibleCmsSlides\.length \? fromCms\(visibleCmsSlides\) : fromCatalog\(products, customPrice\)/);
  assert.match(home, /<HomeHero products=\{products\} slides=\{homeSlides\}/);
  // WCAG 2.2.2: se puede pausar; se pausa con hover y foco; avanza al terminar la barra (sin setInterval).
  assert.match(hero, /aria-label=\{userPaused \? "Reanudar el carrusel" : "Pausar el carrusel"\}/);
  assert.match(hero, /const paused = userPaused \|\| hovered \|\| focused;/);
  assert.match(hero, /onAnimationEnd=\{\(\) => go\(active \+ 1\)\}/);
  assert.doesNotMatch(hero, /setInterval|setTimeout/);
  assert.match(hero, /aria-roledescription="carrusel"/);
  assert.match(hero, /inert=\{!isActive\}/);
  assert.match(hero, /motion-safe:animate-hero-progress/);
  assert.match(hero, /motion-safe:animate-hero-line/);
  for (const name of ["hero-line", "hero-fade", "hero-image", "lr7-hero-progress"]) {
    const frames = styles.match(new RegExp(`@keyframes ${name} \\{[\\s\\S]*?\\n  \\}`))?.[0] ?? "";
    assert.ok(frames, `${name} defined`);
    assert.doesNotMatch(frames.replace(/opacity|transform|scale/g, "").replace(/@keyframes [\w-]+/, ""), /[a-z-]+:/);
  }
  assert.doesNotMatch(styles, /--animate-hero-[\w-]+:[^;]*infinite/);
});
