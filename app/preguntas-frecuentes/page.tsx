"use client";

import { useState } from "react";
import { PageHero } from "@/components/layout/page-hero";

const FAQS = [
  {
    question: "¿Hacen envios a todo Colombia?",
    answer:
      "Si, realizamos envios a cualquier ciudad de Colombia. El tiempo de entrega varia entre 2 y 5 dias habiles dependiendo de tu ubicacion.",
  },
  {
    question: "¿Cuanto tarda mi pedido?",
    answer:
      "Una vez confirmado el pago, procesamos tu pedido en 1-2 dias habiles. El envio tarda entre 2-5 dias adicionales.",
  },
  {
    question: "¿Puedo personalizar mi camiseta?",
    answer:
      "Si. Puedes agregar nombre y numero en camisetas seleccionadas. La personalizacion tiene costo adicional.",
  },
  {
    question: "¿Puedo cambiar la talla?",
    answer:
      "Si, aceptamos cambios dentro de los plazos establecidos siempre que la prenda este sin uso y en perfecto estado.",
  },
];

function Item({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
      <button onClick={() => setOpen((value) => !value)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.5rem 0", background: "none", border: "none", cursor: "pointer", textAlign: "left", gap: "1rem" }}>
        <span className="font-display" style={{ fontWeight: 800, fontSize: "1.05rem", letterSpacing: "0.04em", textTransform: "uppercase", color: open ? "var(--color-accent)" : "#fff", lineHeight: 1.2 }}>
          {question}
        </span>
        <span style={{ color: open ? "var(--color-accent)" : "rgba(255,255,255,0.5)" }}>{open ? "−" : "+"}</span>
      </button>
      <div style={{ maxHeight: open ? "300px" : "0", overflow: "hidden", transition: "max-height 0.35s ease" }}>
        <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.75, fontWeight: 300, paddingBottom: "1.5rem" }}>{answer}</p>
      </div>
    </div>
  );
}

export default function FAQPage() {
  return (
    <>
      <PageHero label="— AYUDA" title="PREGUNTAS FRECUENTES" sub="Encuentra respuestas rapidas a las dudas mas comunes." />
      <section style={{ padding: "5rem 0 7rem", background: "var(--color-white)" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto", padding: "0 2rem" }}>
          {FAQS.map((faq) => (
            <Item key={faq.question} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </section>
    </>
  );
}
