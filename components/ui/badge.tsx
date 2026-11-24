import type { ReactNode } from "react";

// Insignia de señal (Nuevo, Últimas unidades): blanco sobre noche, sin naranja (DESIGN.md → The Sin Naranja Rule).
export function Badge({ children, className }: Readonly<{ children: ReactNode; className?: string }>) {
  return <span className={["ui-badge", className ?? ""].filter(Boolean).join(" ")}>{children}</span>;
}
