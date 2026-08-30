"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { CheckoutHeader } from "@/components/layout/checkout-header";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { WhatsAppFloat } from "@/components/layout/whatsapp-float";

export function SiteShell({ children }: Readonly<{ children: ReactNode }>) {
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
      <Navbar />
      <main>{children}</main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
