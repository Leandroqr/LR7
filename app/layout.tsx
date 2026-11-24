import type { Metadata } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import { SiteShell } from "@/components/layout/site-shell";
import { getPublicNavigation } from "@/lib/content";
import { SITE_CONFIG } from "@/lib/site";
import "@/app/styles.css";

// UX9: solo los pesos que se pintan de verdad (medido en las 20 rutas públicas a 390 y 1280 px). Barlow
// Condensed 600 y Barlow 300 no se usaban; quitarlos baja de 14 a 11 archivos de fuente.
const displayFont = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

// La fuente de texto no se precarga: así no compite con la de los titulares, que es la del LCP.
const bodyFont = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.baseUrl),
  title: {
    default: `${SITE_CONFIG.name} — Fútbol & Training en Colombia`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: SITE_CONFIG.locale,
    url: "/",
    title: `${SITE_CONFIG.name} — Fútbol & Training en Colombia`,
    description: SITE_CONFIG.description,
    siteName: SITE_CONFIG.name,
    images: [
      {
        url: "/icon.svg",
        width: 512,
        height: 512,
        alt: `${SITE_CONFIG.name} logo`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_CONFIG.name} — Fútbol & Training en Colombia`,
    description: SITE_CONFIG.description,
    images: ["/icon.svg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const navigation = await getPublicNavigation();
  return (
    <html lang="es" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body>
        <AppProviders>
          <SiteShell navigation={navigation}>{children}</SiteShell>
        </AppProviders>
      </body>
    </html>
  );
}
