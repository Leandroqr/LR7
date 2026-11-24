import type { ButtonHTMLAttributes, ReactNode } from "react";

// Botón de icono: área táctil de 44 px y nombre accesible obligatorio (DESIGN.md → Navigation).
export function IconButton({
  label,
  children,
  className,
  type = "button",
  ...props
}: Readonly<{ label: string; children: ReactNode }> & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label">) {
  return (
    <button type={type} aria-label={label} className={["ui-icon-button", className ?? ""].filter(Boolean).join(" ")} {...props}>
      <span aria-hidden="true" className="ui-icon-button-glyph">{children}</span>
    </button>
  );
}
