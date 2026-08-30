"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
  return (
    <main style={{ minHeight: "70vh", padding: "10rem 2rem 6rem", background: "var(--color-white)", color: "var(--color-dark)", textAlign: "center" }}>
      <p className="font-display" style={{ color: "var(--color-accent)", fontWeight: 800, letterSpacing: "0.18em", marginBottom: "1rem" }}>
        LR7 / ERROR
      </p>
      <h1 className="font-display" style={{ fontSize: "clamp(2.5rem, 7vw, 5rem)", lineHeight: 0.9, marginBottom: "1.5rem" }}>
        ALGO NO SALIÓ BIEN.
      </h1>
      <p style={{ maxWidth: "520px", margin: "0 auto 2rem", color: "var(--color-text-muted)", lineHeight: 1.7 }}>
        No pudimos cargar esta parte de la tienda. Intenta de nuevo o vuelve al catálogo.
      </p>
      <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
        <button type="button" className="btn-primary" onClick={reset}>
          INTENTAR DE NUEVO
        </button>
        <Link href="/tienda" className="btn-outline">
          IR AL CATÁLOGO
        </Link>
      </div>
    </main>
  );
}
