import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Nosotros",
  description: "Conoce la historia y la esencia de LR7.",
  alternates: { canonical: "/nosotros" },
};

type Section = {
  label: string;
  title: string;
  body: string;
  img: string;
  reverse: boolean;
};

const sections: Section[] = [
  {
    label: "- NUESTRA HISTORIA",
    title: "NACIÓ DEL JUEGO",
    body: "LR7 nació de una obsesión: encontrar camisetas de fútbol que fueran tan buenas como la pasión que representan. Cansados de productos genéricos y calidad mediocre, decidimos crear algo diferente. Una marca que entiende al hincha, al jugador y al coleccionista.",
    img: "https://images.unsplash.com/photo-1599204606471-32a75bc663e9?w=800&h=1000&fit=crop&auto=format",
    reverse: false,
  },
  {
    label: "- POR QUÉ EXISTIMOS",
    title: "LA CAMISETA ES IDENTIDAD",
    body: "En Colombia, el fútbol no es solo un deporte. Es una forma de vida, de conectar y de pertenecer. Cada camiseta cuenta una historia: la tuya, la de tu equipo y la de tu país. Nosotros hacemos que esa historia se sienta en cada detalle.",
    img: "https://images.unsplash.com/photo-1608211070124-c747f619754f?w=800&h=1000&fit=crop&auto=format",
    reverse: true,
  },
  {
    label: "- NUESTRA VISIÓN",
    title: "LA MARCA QUE EL FÚTBOL MERECE",
    body: "Queremos ser la marca de referencia para los amantes del fútbol en Colombia y Latinoamérica. No como un marketplace más, sino como una comunidad que vive el juego. Cada camiseta lleva nuestro compromiso de calidad y pasión.",
    img: "https://images.unsplash.com/photo-1671680134709-4978c22fb916?w=800&h=1000&fit=crop&auto=format",
    reverse: false,
  },
];

const pillars = [
  {
    icon: "*",
    title: "PASIÓN",
    desc: "Cada camiseta nace de una pasión genuina por el fútbol. No hacemos solo productos: hacemos símbolos de identidad.",
  },
  {
    icon: "*",
    title: "CALIDAD",
    desc: "Materiales premium, acabados de nivel internacional y control exigente. Tu camiseta tiene que durar tanto como tu amor por el juego.",
  },
  {
    icon: "*",
    title: "IDENTIDAD",
    desc: "Tu camiseta dice quien eres. Nosotros hacemos que ese mensaje sea claro, poderoso y completamente tuyo.",
  },
];

export default function AboutPage() {
  return (
    <div style={{ background: "var(--color-white)", paddingTop: "80px" }}>
      <section style={{ position: "relative", minHeight: "80vh", display: "flex", alignItems: "center", overflow: "hidden", color: "var(--color-text-on-dark)" }}>
        <Image
          src="https://images.unsplash.com/photo-1490108474814-221f6198acc5?w=1600&h=1000&fit=crop&auto=format"
          alt="Jugadores en cancha"
          fill
          sizes="100vw"
          style={{ objectFit: "cover", filter: "brightness(0.2)" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(10,10,10,0.95) 50%, rgba(10,10,10,0.3))" }} />

        <div style={{ position: "relative", zIndex: 2, maxWidth: "1440px", margin: "0 auto", padding: "4rem 2rem", width: "100%" }}>
          <p className="font-display" style={{ fontSize: "0.8rem", letterSpacing: "0.25em", color: "var(--color-accent-on-dark)", textTransform: "uppercase", marginBottom: "1rem" }}>
            - NUESTRA HISTORIA
          </p>
          <h1 className="font-display" style={{ fontSize: "clamp(3rem, 9vw, 7.5rem)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.88, marginBottom: "1.5rem" }}>
            NO VENDEMOS
            <br />
            SOLO
            <br />
            <span style={{ color: "var(--color-accent)" }}>CAMISETAS.</span>
          </h1>
          <p style={{ fontSize: "1.1rem", color: "var(--color-text-muted-on-dark)", maxWidth: "480px", lineHeight: 1.7, fontWeight: 300 }}>
            Vendemos una forma de llevar tu pasión contigo.
          </p>
        </div>
      </section>

      {sections.map((sec) => (
        <section key={sec.title} style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "6rem 0" }}>
          <div className="about-grid" style={{ maxWidth: "1440px", margin: "0 auto", padding: "0 2rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5rem", alignItems: "center", direction: sec.reverse ? "rtl" : "ltr" }}>
            <div style={{ direction: "ltr" }}>
              <p className="font-display" style={{ fontSize: "0.75rem", letterSpacing: "0.25em", color: "var(--color-accent)", textTransform: "uppercase", marginBottom: "1rem" }}>{sec.label}</p>
              <h2 className="font-display" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.9, marginBottom: "1.5rem" }}>{sec.title}</h2>
              <p style={{ fontSize: "1rem", color: "var(--color-text-muted)", lineHeight: 1.8, fontWeight: 300 }}>{sec.body}</p>
            </div>
            <div className="img-zoom" style={{ aspectRatio: "3/4", background: "#111", overflow: "hidden", direction: "ltr", position: "relative" }}>
              <Image src={sec.img} alt={sec.title} fill sizes="(max-width: 900px) 100vw, 50vw" style={{ objectFit: "cover", filter: "brightness(0.8)" }} />
            </div>
          </div>
        </section>
      ))}

      <section style={{ background: "#0f0f0f", color: "var(--color-text-on-dark)", padding: "6rem 0", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: "1440px", margin: "0 auto", padding: "0 2rem" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <p className="font-display" style={{ fontSize: "0.8rem", letterSpacing: "0.25em", color: "var(--color-accent-on-dark)", textTransform: "uppercase", marginBottom: "0.75rem" }}>
              - NUESTRA ESENCIA
            </p>
            <h2 className="font-display" style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.9 }}>
              HECHO PARA QUIENES
              <br />
              VIVEN EL JUEGO.
            </h2>
          </div>

          <div className="pillars-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px", background: "rgba(255,255,255,0.06)" }}>
            {pillars.map((p) => (
              <div key={p.title} style={{ background: "#0f0f0f", padding: "3.5rem 2.5rem", borderTop: "3px solid transparent", textAlign: "center" }}>
                <div aria-hidden="true" style={{ fontSize: "1.5rem", color: "var(--color-accent-on-dark)", marginBottom: "1.25rem" }}>{p.icon}</div>
                <h3 className="font-display" style={{ fontSize: "2rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "1rem" }}>{p.title}</h3>
                <p style={{ fontSize: "0.9rem", color: "var(--color-text-muted-on-dark)", lineHeight: 1.75, fontWeight: 300 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "6rem 2rem", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <p className="font-display" style={{ fontSize: "0.8rem", letterSpacing: "0.25em", color: "var(--color-accent)", textTransform: "uppercase", marginBottom: "1rem" }}>
          - UNETE
        </p>
        <h2 className="font-display" style={{ fontSize: "clamp(3rem, 7vw, 6rem)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.88, marginBottom: "2rem" }}>
          ENCUENTRA LA TUYA
        </h2>
        <Link href="/tienda" className="btn-primary">
          VER CATÁLOGO {">"}
        </Link>
      </section>

      <style>{`.about-grid{grid-template-columns:1fr 1fr !important;} .pillars-grid{grid-template-columns:repeat(3,1fr) !important;} @media(max-width:900px){.about-grid{grid-template-columns:1fr !important;direction:ltr !important;gap:2rem !important;} .pillars-grid{grid-template-columns:1fr !important;}}`}</style>
    </div>
  );
}
