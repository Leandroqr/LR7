import Link from "next/link";
import type { ReactNode } from "react";
import { logoutAdmin } from "@/app/admin/login/actions";

const ADMIN_LINKS = [
  ["Dashboard", "/admin/dashboard"],
  ["Productos", "/admin/products"],
  ["Categorías", "/admin/categories"],
  ["Inventario", "/admin/inventory"],
  ["Pedidos", "/admin/orders"],
  ["Usuarios", "/admin/users"],
  ["Home", "/admin/home"],
  ["Navegación", "/admin/navigation"],
  ["Newsletter", "/admin/newsletter"],
] as const;

export function AdminShell({ children, email }: Readonly<{ children: ReactNode; email: string }>) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link href="/admin/dashboard" className="admin-brand">LR<span>7</span> ADMIN</Link>
        <nav aria-label="Administración">
          {ADMIN_LINKS.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
        </nav>
        <div className="admin-session">
          <span>{email}</span>
          <form action={logoutAdmin}><button type="submit">CERRAR SESIÓN</button></form>
        </div>
      </aside>
      <div className="admin-content">{children}</div>
    </div>
  );
}
