"use client";

import { useId, type InputHTMLAttributes } from "react";

// Campo con etiqueta siempre visible, ayuda y error enlazados por aria-describedby (DESIGN.md → Inputs / Fields).
export function Field({
  label,
  hint,
  error,
  id,
  className,
  ...inputProps
}: Readonly<{ label: string; hint?: string; error?: string }> & InputHTMLAttributes<HTMLInputElement>) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [inputProps["aria-describedby"], hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={["ui-field", error ? "has-error" : "", className ?? ""].filter(Boolean).join(" ")}>
      <label htmlFor={inputId}>{label}</label>
      <input id={inputId} aria-invalid={error ? true : undefined} {...inputProps} aria-describedby={describedBy} />
      {hint ? <p id={hintId} className="ui-field-hint">{hint}</p> : null}
      {error ? <p id={errorId} className="ui-field-error" role="alert">{error}</p> : null}
    </div>
  );
}
