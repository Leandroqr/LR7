type PageHeroProps = {
  label: string;
  title: string;
  sub?: string;
};

export function PageHero({ label, title, sub }: Readonly<PageHeroProps>) {
  return (
    <section style={{ paddingTop: "120px", paddingBottom: "4rem", borderBottom: "1px solid rgba(7,20,38,0.1)", background: "var(--color-white)" }}>
      <div style={{ maxWidth: "1440px", margin: "0 auto", padding: "0 2rem" }}>
        <p className="font-display" style={{ fontSize: "0.75rem", letterSpacing: "0.25em", color: "var(--color-accent)", textTransform: "uppercase", marginBottom: "0.75rem" }}>
          {label}
        </p>
        <h1 className="font-display" style={{ fontSize: "clamp(2rem, 7vw, 6rem)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.9, marginBottom: sub ? "1rem" : 0 }}>
          {title}
        </h1>
        {sub ? (
          <p style={{ fontSize: "1rem", color: "var(--color-text-muted)", fontWeight: 300, maxWidth: "500px", lineHeight: 1.6 }}>
            {sub}
          </p>
        ) : null}
      </div>
    </section>
  );
}
