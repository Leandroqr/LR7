"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Analytics } from "@/components/analytics/analytics";
import { MiniCart } from "@/components/commerce/mini-cart";
import { CheckoutHeader } from "@/components/layout/checkout-header";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { WhatsAppFloat, type WhatsAppProduct } from "@/components/layout/whatsapp-float";
import { SiteScopeProvider } from "@/components/providers/site-scope-context";
import type { LegalPage } from "@/lib/legal-pages";
import type { NavigationItem } from "@/lib/content";

type SiteShellProps = Readonly<{
  children: ReactNode;
  navigation: NavigationItem[];
  hiddenHrefs: string[];
  legalPages: LegalPage[];
  whatsappProducts: WhatsAppProduct[];
}>;

export function SiteShell({ children, navigation, hiddenHrefs, legalPages, whatsappProducts }: SiteShellProps) {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return <>{children}</>;
  }

  const scope = { hiddenHrefs, legalPages };

  if (pathname === "/carrito") {
    return (
      <SiteScopeProvider value={scope}>
        <Analytics />
        <CheckoutHeader />
        <main>{children}</main>
        <WhatsAppFloat products={whatsappProducts} />
      </SiteScopeProvider>
    );
  }

  return (
    <SiteScopeProvider value={scope}>
      <Analytics />
      <Navbar navigation={navigation.filter((item) => item.location === "header")} />
      <main>{children}</main>
      <Footer navigation={navigation.filter((item) => item.location === "footer")} />
      <WhatsAppFloat products={whatsappProducts} />
      <MiniCart />
    </SiteScopeProvider>
  );
}
