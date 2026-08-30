import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Favoritos",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/favoritos",
  },
};

export default function FavoritesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
