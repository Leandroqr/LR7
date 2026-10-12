"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { CheckoutHeader } from "@/components/layout/checkout-header";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { WhatsAppFloat } from "@/components/layout/whatsapp-float";
import type { NavigationItem } from "@/lib/content";

export function SiteShell({ children, navigation }: Readonly<{ children: ReactNode; navigation: NavigationItem[] }>) {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return <>{children}</>;
  }

  if (pathname === "/carrito") {
    return (
      <>
        <CheckoutHeader />
        <main>{children}</main>
        <WhatsAppFloat />
      </>
    );
  }

  return (
    <>
      <Navbar navigation={navigation.filter((item) => item.location === "header")} />
      <main>{children}</main>
      <Footer navigation={navigation.filter((item) => item.location === "footer")} />
      <WhatsAppFloat />
    </>
  );
}
