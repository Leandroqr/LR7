import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Preguntas frecuentes",
  description: "Resuelve preguntas frecuentes sobre productos, tallas, personalización y compra en LR7.",
  alternates: { canonical: "/preguntas-frecuentes" },
};

export default function FaqLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
