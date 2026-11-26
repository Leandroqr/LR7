"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useState } from "react";
import { useSiteScope } from "@/components/providers/site-scope-context";
import { legalHref } from "@/lib/legal-pages";
import {
  CONSENT_OPEN_EVENT,
  CONSENT_STORAGE_KEY,
  GA_MEASUREMENT_ID,
  parseConsent,
  type ConsentChoice,
} from "@/lib/analytics";

type GtagWindow = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };

function readConsent(): ConsentChoice | null {
  try {
    return parseConsent(localStorage.getItem(CONSENT_STORAGE_KEY));
  } catch {
    return null;
  }
}

function saveConsent(choice: ConsentChoice) {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, choice);
  } catch {
    // Sin almacenamiento (navegación privada): la decisión vale solo para esta visita.
  }
}

/** Prepara gtag con el modo de consentimiento de Google. Solo se llama después de aceptar. */
function initGtag() {
  const analyticsWindow = window as GtagWindow;
  if (analyticsWindow.gtag) {
    analyticsWindow.gtag("consent", "update", { analytics_storage: "granted" });
    return;
  }
  analyticsWindow.dataLayer = analyticsWindow.dataLayer ?? [];
  analyticsWindow.gtag = function gtag() {
    // gtag.js espera el objeto `arguments`, no un array.
    // eslint-disable-next-line prefer-rest-params
    analyticsWindow.dataLayer?.push(arguments);
  };
  analyticsWindow.gtag("consent", "default", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  analyticsWindow.gtag("js", new Date());
  // Las visitas entre páginas las registra GA4 solo (medición mejorada: cambios del historial del navegador).
  analyticsWindow.gtag("config", GA_MEASUREMENT_ID, { anonymize_ip: true });
}

/** Al rechazar después de haber aceptado: Google deja de guardar cookies y se borran las suyas. */
function revokeGtag() {
  const analyticsWindow = window as GtagWindow;
  analyticsWindow.gtag?.("consent", "update", { analytics_storage: "denied" });
  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0]?.trim();
    if (!name || !(name === "_ga" || name.startsWith("_ga_"))) continue;
    const domains = ["", location.hostname, `.${location.hostname.split(".").slice(-2).join(".")}`];
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ""}`;
    }
  }
}

const BUTTON = "inline-flex min-h-11 flex-1 items-center justify-center rounded-button px-5 font-heading text-[0.8125rem] font-bold tracking-[0.1em] uppercase focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-action-on-dark sm:flex-none";

/**
 * Google Analytics 4 con consentimiento previo. Sin ID de medición no renderiza nada.
 * El aviso aparece hasta que el visitante decide; "Preferencias de cookies" en el pie lo vuelve a abrir.
 */
export function Analytics() {
  const { legalPages } = useSiteScope();
  const [consent, setConsent] = useState<ConsentChoice | null>(null);
  const [bannerOpen, setBannerOpen] = useState(false);

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return;
    const stored = readConsent();
    // Lectura única del navegador al montar (localStorage no existe en el servidor).
    setConsent(stored);
    if (stored === "granted") initGtag();
    else if (!stored) setBannerOpen(true);
    const open = () => setBannerOpen(true);
    window.addEventListener(CONSENT_OPEN_EVENT, open);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, open);
  }, []);

  if (!GA_MEASUREMENT_ID) return null;

  const decide = (choice: ConsentChoice) => {
    saveConsent(choice);
    setConsent(choice);
    setBannerOpen(false);
    if (choice === "granted") initGtag();
    else revokeGtag();
  };

  const privacy = legalPages.find((page) => page.slug === "aviso-de-privacidad") ?? legalPages.find((page) => page.slug === "tratamiento-de-datos");

  return (
    <>
      {consent === "granted" ? (
        <Script id="lr7-gtag" src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
      ) : null}
      {bannerOpen ? (
        <section
          className="consent-banner fixed inset-x-0 bottom-0 z-[90] border-0 border-t border-solid border-white/15 bg-night text-white shadow-[0_-8px_24px_rgb(0_0_0/0.25)] sm:inset-x-auto sm:right-4 sm:bottom-4 sm:max-w-[440px] sm:rounded-button sm:border"
          aria-labelledby="consent-title"
        >
          <div className="grid gap-3 p-4 sm:p-5">
            <h2 id="consent-title" className="m-0 text-body font-semibold text-white">Cookies de analítica</h2>
            <p className="m-0 text-body-sm leading-relaxed text-white/80">
              Con tu permiso usamos Google Analytics para saber cómo se usa la tienda y mejorarla. No las activamos si no aceptas.
              {privacy ? <> <Link href={legalHref(privacy)} className="text-white underline underline-offset-3">{privacy.label}</Link>.</> : null}
            </p>
            <div className="flex gap-3">
              <button type="button" className={`${BUTTON} border border-solid border-white/40 bg-transparent text-white hover:border-white hover:bg-white/10`} onClick={() => decide("denied")}>
                Rechazar
              </button>
              <button type="button" className={`${BUTTON} border border-solid border-white bg-white text-night hover:bg-white/90`} onClick={() => decide("granted")}>
                Aceptar
              </button>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
