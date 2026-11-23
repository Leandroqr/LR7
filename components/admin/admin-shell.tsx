import Link from "next/link";
import type { ReactNode } from "react";
import { logoutAdmin } from "@/app/admin/login/actions";
import { AdminToastRegion } from "@/components/admin/admin-crud";
import { AdminNav } from "@/components/admin/admin-nav";

export function AdminShell({ children, email, preview = false }: Readonly<{ children: ReactNode; email: string; preview?: boolean }>) {
  return (
    <div className={`admin-shell${preview ? " is-preview" : ""}`}>
      <a className="admin-skip-link" href="#admin-main">Saltar al contenido</a>
      <aside className="admin-sidebar">
        <Link href="/admin/dashboard" className="admin-brand">LR<span>7</span> ADMIN</Link>
        {preview ? <p className="admin-preview-label">MODO PREVIEW · SOLO LECTURA</p> : null}
        <AdminNav />
        <div className="admin-session">
          <span title={preview ? undefined : email}>{preview ? "Sin sesión administrativa" : email}</span>
          <div className="admin-session-links">
            <Link href="/" target="_blank" rel="noopener">VER TIENDA ↗</Link>
            {preview ? null : <form action={logoutAdmin}><button type="submit">CERRAR SESIÓN</button></form>}
          </div>
        </div>
      </aside>
      <div className="admin-content" id="admin-main" tabIndex={-1}>
        {preview ? <p className="admin-preview-notice" role="note">Vista previa sin sesión real: RLS puede ocultar datos administrativos. Inicia sesión con una cuenta ADMIN para consultar y modificar datos.</p> : null}
        {preview ? (
          <fieldset className="admin-preview-fieldset" disabled aria-label="Administración en modo de solo lectura">
            {children}
          </fieldset>
        ) : children}
      </div>
      <AdminToastRegion />
    </div>
  );
}
