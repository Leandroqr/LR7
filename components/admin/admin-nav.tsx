"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
  ["Contenido y ajustes", "/admin/content"],
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Administración" className="admin-nav">
      {ADMIN_LINKS.map(([label, href]) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return <Link key={href} href={href} aria-current={active ? "page" : undefined}>{label}</Link>;
      })}
    </nav>
  );
}
