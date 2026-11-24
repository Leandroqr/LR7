import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";

// Botón del sistema (DESIGN.md → Components → Buttons). Las clases mapean a los estilos
// existentes (.btn-primary / .btn-outline) para que la migración sea gradual.
export type ButtonVariant = "primary" | "secondary" | "on-dark" | "text";

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: "btn-primary",
  secondary: "btn-outline",
  "on-dark": "btn-on-dark",
  text: "btn-text",
};

export function buttonClassName(variant: ButtonVariant = "primary", block = false, extra?: string) {
  return [VARIANT_CLASS[variant], block ? "btn-block" : "", extra ?? ""].filter(Boolean).join(" ");
}

type CommonProps = Readonly<{
  variant?: ButtonVariant;
  /** Ocupa todo el ancho del contenedor (paneles de compra, cajones). */
  block?: boolean;
  children: ReactNode;
}>;

export function Button({ variant, block, className, type = "button", children, ...props }: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={buttonClassName(variant, block, className)} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({ variant, block, className, children, ...props }: CommonProps & ComponentProps<typeof Link>) {
  return (
    <Link className={buttonClassName(variant, block, className)} {...props}>
      {children}
    </Link>
  );
}
