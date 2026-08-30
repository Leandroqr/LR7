import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Carrito",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/carrito",
  },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
