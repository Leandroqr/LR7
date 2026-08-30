import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Contacta a LR7 para resolver dudas sobre camisetas de fútbol, training, tallas y pedidos.",
  alternates: { canonical: "/contacto" },
};

export default function ContactLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
