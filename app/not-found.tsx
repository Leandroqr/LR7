import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--color-white)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "2rem", paddingTop: "80px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
        <span className="font-display" style={{ fontSize: "clamp(12rem, 40vw, 30rem)", fontWeight: 900, color: "rgba(255,255,255,0.03)", lineHeight: 1, userSelect: "none" }}>
          404
        </span>
      </div>
      <div style={{ position: "relative", zIndex: 2 }}>
        <p className="font-display" style={{ fontSize: "0.8rem", letterSpacing: "0.25em", color: "var(--color-accent)", textTransform: "uppercase", marginBottom: "1rem" }}>
          — ERROR 404
        </p>
        <h1 className="font-display" style={{ fontSize: "clamp(2.5rem, 7vw, 6rem)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.9, marginBottom: "1.5rem" }}>
          ESTA JUGADA
          <br />
          NO EXISTE.
        </h1>
        <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.5)", marginBottom: "3rem", fontWeight: 300 }}>
          Parece que la pagina que buscas salio de la cancha.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/" className="btn-primary">VOLVER AL INICIO</Link>
          <Link href="/tienda" className="btn-outline">VER CATALOGO</Link>
        </div>
      </div>
    </div>
  );
}
