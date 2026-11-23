"use client";

import Link from "next/link";

export default function AdminErrorPage({ error, reset }: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
  return (
    <main className="admin-page">
      <header className="admin-page-header">
        <div>
          <p>LR7 / ADMIN</p>
          <h1>No se pudo cargar</h1>
          <span>La consulta a la base de datos falló. Puede ser un problema temporal de conexión o de permisos.</span>
        </div>
      </header>
      <section className="admin-panel" role="alert">
        <p>Intenta de nuevo. Si el problema continúa, comparte esta referencia con soporte: <code>{error.digest ?? "sin referencia"}</code></p>
        <div className="admin-error-actions">
          <button type="button" className="admin-primary" onClick={reset}>REINTENTAR</button>
          <Link href="/admin/dashboard">Volver al dashboard</Link>
        </div>
      </section>
    </main>
  );
}
