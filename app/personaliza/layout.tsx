import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Personaliza tu camiseta de fútbol",
  description: "Personaliza tu camiseta LR7 con nombre, número y talla antes de agregarla al carrito.",
  alternates: { canonical: "/personaliza" },
};

export default function PersonalizaLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
