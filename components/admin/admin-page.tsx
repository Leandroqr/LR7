import Link from "next/link";
import type { ReactNode } from "react";

export function AdminPage({ title, description, action, back, children }: Readonly<{ title: string; description?: string; action?: ReactNode; back?: { href: string; label: string }; children: ReactNode }>) {
  return (
    <main className="admin-page">
      <header className="admin-page-header">
        <div>
          {back ? <Link className="admin-back-link" href={back.href}>← {back.label}</Link> : <p>LR7 / ADMIN</p>}
          <h1>{title}</h1>
          {description ? <span>{description}</span> : null}
        </div>
        {action ? <div className="admin-page-actions">{action}</div> : null}
      </header>
      {children}
    </main>
  );
}

export function AdminEmpty({ children, action }: Readonly<{ children: ReactNode; action?: ReactNode }>) {
  return <div className="admin-empty"><p>{children}</p>{action}</div>;
}

/** Server-rendered GET filter bar: works without JavaScript and keeps filters in the URL. */
export function AdminFilters({ children, resetHref, active }: Readonly<{ children: ReactNode; resetHref: string; active: boolean }>) {
  return (
    <form className="admin-filters" role="search" method="get">
      {children}
      <button type="submit">FILTRAR</button>
      {active ? <Link href={resetHref}>Limpiar filtros</Link> : null}
    </form>
  );
}

export function AdminResultCount({ shown, noun, limit }: Readonly<{ shown: number; noun: string; limit?: number }>) {
  return <p className="admin-result-count">{limit && shown >= limit ? `Mostrando los ${limit} ${noun} más recientes. Usa los filtros para acotar.` : `${shown} ${noun}`}</p>;
}
