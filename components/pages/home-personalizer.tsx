"use client";

import { useMemo, useState } from "react";
import { WhatsAppLink } from "@/components/commerce/whatsapp-link";
import { JerseySVG } from "@/components/graphics/jersey-svg";

type PersonalizerProps = {
  basePrice: number;
};

export function HomePersonalizer({ basePrice }: PersonalizerProps) {
  const [name, setName] = useState("LEANDRO");
  const [number, setNumber] = useState("10");
  const [view, setView] = useState<"front" | "back">("back");
  const [selectedSize, setSelectedSize] = useState("M");
  const [personType, setPersonType] = useState<"both" | "number" | "none">("both");

  const sizes = ["S", "M", "L", "XL", "XXL"];
  const customPrice = personType !== "none" ? 15000 : 0;
  const total = basePrice + customPrice;

  const whatsappMessage = useMemo(() => {
    return [
      "Hola, quiero personalizar una camiseta:",
      `• Nombre: ${personType === "both" ? name || "Sin nombre" : "No aplica"}`,
      `• Número: ${personType !== "none" ? number || "Sin número" : "No aplica"}`,
      `• Talla: ${selectedSize}`,
      `• Total estimado: $${total.toLocaleString("es-CO")}`,
    ].join("\n");
  }, [name, number, personType, selectedSize, total]);

  return (
    <section style={{ padding: "7rem 0 6rem", background: "var(--color-white)", borderTop: "1px solid var(--color-border)" }}>
      <div style={{ maxWidth: "1440px", margin: "0 auto", padding: "0 2rem" }}>
        <div style={{ textAlign: "center", marginBottom: "4.5rem" }}>
          <p className="font-display" style={{ fontSize: "0.8rem", letterSpacing: "0.25em", color: "var(--color-accent)", textTransform: "uppercase", marginBottom: "0.75rem" }}>
            — PERSONALIZACIÓN
          </p>
          <h2 className="font-display" style={{ fontSize: "clamp(3.5rem, 9vw, 7rem)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.88, marginBottom: "0.8rem" }}>
            HAZLA TUYA.
          </h2>
          <p style={{ fontSize: "1rem", color: "var(--color-text-muted)", fontWeight: 300 }}>
            Personaliza tu camiseta de fútbol con nombre, número y talla.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "start" }} className="personalizer-grid">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem", position: "sticky", top: "100px" }}>
            <fieldset style={{ display: "flex", border: "1px solid var(--color-border)", overflow: "hidden", padding: 0, margin: 0 }}>
              <legend className="sr-only">Vista de camiseta</legend>
              {(["front", "back"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setView(option)}
                  style={{
                    padding: "0.55rem 1.5rem",
                    fontFamily: "'Barlow Condensed'",
                    fontWeight: 800,
                    fontSize: "0.8rem",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    border: "none",
                    cursor: "pointer",
                    background: view === option ? "var(--color-accent)" : "transparent",
                    color: view === option ? "var(--color-white)" : "var(--color-dark)",
                  }}
                  aria-pressed={view === option}
                >
                  {option === "front" ? "FRENTE" : "ESPALDA"}
                </button>
              ))}
            </fieldset>
            <JerseySVG name={name} number={number} view={view} personType={personType} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.15rem" }}>
            <fieldset style={{ display: "flex", flexDirection: "column", gap: "2px", border: "none", padding: 0, margin: 0 }}>
              <legend style={{ fontSize: "0.7rem", letterSpacing: "0.18em", color: "rgba(255,255,255,0.4)", fontFamily: "'Barlow Condensed'", fontWeight: 700, textTransform: "uppercase", marginBottom: "0.6rem" }}>
                Tipo de personalización
              </legend>
              {[
                { val: "both", label: "Nombre + número" },
                { val: "number", label: "Solo número" },
                { val: "none", label: "Sin personalización" },
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => setPersonType(item.val as "both" | "number" | "none")}
                  style={{
                    textAlign: "left",
                    padding: "0.8rem 1rem",
                    background: personType === item.val ? "rgba(17,82,232,0.07)" : "transparent",
                    border: `1px solid ${personType === item.val ? "var(--color-accent)" : "rgba(255,255,255,0.08)"}`,
                    color: "var(--color-dark)",
                    cursor: "pointer",
                    fontFamily: "'Barlow Condensed'",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                  aria-pressed={personType === item.val}
                >
                  {item.label}
                </button>
              ))}
            </fieldset>

            {personType === "both" ? (
              <label style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                <span style={{ fontSize: "0.7rem", letterSpacing: "0.18em", color: "rgba(255,255,255,0.4)", fontFamily: "'Barlow Condensed'", fontWeight: 700, textTransform: "uppercase" }}>
                  Nombre (max 12)
                </span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value.slice(0, 12).toUpperCase())}
                  placeholder="EJ. LEANDRO"
                  autoComplete="off"
                  maxLength={12}
                  style={{ width: "100%", padding: "0.9rem 1.1rem", background: "var(--color-ice)", border: "1px solid var(--color-border)", color: "var(--color-dark)", fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "1.1rem", letterSpacing: "0.1em", textTransform: "uppercase", outline: "none" }}
                />
              </label>
            ) : null}

            {personType !== "none" ? (
              <label style={{ display: "flex", flexDirection: "column", gap: "0.45rem", maxWidth: "170px" }}>
                <span style={{ fontSize: "0.7rem", letterSpacing: "0.18em", color: "rgba(255,255,255,0.4)", fontFamily: "'Barlow Condensed'", fontWeight: 700, textTransform: "uppercase" }}>
                  Número (max 2)
                </span>
                <input
                  value={number}
                  onChange={(event) => setNumber(event.target.value.replace(/\D/g, "").slice(0, 2))}
                  placeholder="10"
                  autoComplete="off"
                  inputMode="numeric"
                  maxLength={2}
                  style={{ width: "100%", padding: "0.9rem 1rem", background: "var(--color-ice)", border: "1px solid var(--color-border)", color: "var(--color-accent)", fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "1.4rem", textAlign: "center", letterSpacing: "0.05em", outline: "none" }}
                />
              </label>
            ) : null}

            <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
              <legend style={{ fontSize: "0.7rem", letterSpacing: "0.18em", color: "rgba(255,255,255,0.4)", fontFamily: "'Barlow Condensed'", fontWeight: 700, textTransform: "uppercase", marginBottom: "0.7rem" }}>
                Talla
              </legend>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {sizes.map((size) => (
                  <button key={size} type="button" className={`size-btn ${selectedSize === size ? "active" : ""}`} onClick={() => setSelectedSize(size)}>
                    {size}
                  </button>
                ))}
              </div>
            </fieldset>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", fontWeight: 300 }}>Camiseta base</span>
                <span className="font-display" style={{ fontWeight: 700 }}>${basePrice.toLocaleString("es-CO")}</span>
              </div>
              {personType !== "none" ? (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", fontWeight: 300 }}>Personalización</span>
                  <span className="font-display" style={{ fontWeight: 700, color: "var(--color-accent)" }}>+${customPrice.toLocaleString("es-CO")}</span>
                </div>
              ) : null}
              <div style={{ height: "1px", background: "rgba(255,255,255,0.07)" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="font-display" style={{ fontWeight: 800, fontSize: "1rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>TOTAL</span>
                <span className="font-display" style={{ fontWeight: 900, fontSize: "1.7rem", color: "var(--color-accent)" }}>${total.toLocaleString("es-CO")}</span>
              </div>
            </div>

            <WhatsAppLink
              message={whatsappMessage}
              eventName="product_whatsapp_click"
              eventData={{ placement: "home_personalizer", size: selectedSize }}
              className="btn-outline"
              style={{ justifyContent: "center" }}
              aria-label="Consultar personalización por WhatsApp"
            >
              CONSULTAR POR WHATSAPP
            </WhatsAppLink>
          </div>
        </div>
      </div>
    </section>
  );
}
