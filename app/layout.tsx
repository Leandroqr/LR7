import type { Metadata } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import { SiteShell } from "@/components/layout/site-shell";
import { getPublicNavigation } from "@/lib/content";
import { SITE_CONFIG } from "@/lib/site";
import "@/app/globals.css";

const displayFont = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

const bodyFont = Barlow({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
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
