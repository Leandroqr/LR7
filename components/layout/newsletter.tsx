"use client";

import { useState } from "react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  };

  return (
    <section className="newsletter" aria-labelledby="newsletter-title">
      <div className="newsletter-watermark" aria-hidden="true">7</div>
      <div className="newsletter-inner">
        <p className="font-display newsletter-eyebrow">07 — ACCESO LR7</p>
        <h2 id="newsletter-title" className="font-display newsletter-title">
          ENTRA AL<br /><span>CÍRCULO.</span>
        </h2>
        <p className="newsletter-copy">
          Drops exclusivos, novedades de fútbol y <strong>10% de descuento</strong> en tu primera compra.
        </p>

        {submitted ? (
          <div className="newsletter-success" role="status">
            <span className="font-display">LISTO.</span>
            <p>Revisa tu correo para activar tu beneficio.</p>
          </div>
        ) : (
          <form className="newsletter-form" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor="newsletter-email">Tu correo electrónico</label>
            <input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="TU CORREO ELECTRÓNICO"
              autoComplete="email"
              required
            />
            <button type="submit" className="btn-primary">UNIRME Y OBTENER 10%</button>
          </form>
        )}
        <p className="newsletter-note">Sin spam. Solo lo esencial. Puedes salir cuando quieras.</p>
      </div>
    </section>
  );
}
