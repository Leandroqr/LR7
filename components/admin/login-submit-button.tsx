"use client";

import { useFormStatus } from "react-dom";

export function LoginSubmitButton({ disabled }: Readonly<{ disabled: boolean }>) {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={disabled || pending} aria-busy={pending}>{pending ? "VERIFICANDO…" : "INICIAR SESIÓN"}</button>;
}
