import type { ReactNode } from "react";

export function AdminPage({ title, description, action, children }: Readonly<{ title: string; description?: string; action?: ReactNode; children: ReactNode }>) {
  return (
    <main className="admin-page">
      <header className="admin-page-header">
        <div><p>LR7 / ADMIN</p><h1>{title}</h1>{description ? <span>{description}</span> : null}</div>
        {action}
      </header>
      {children}
    </main>
  );
}

export function AdminEmpty({ children }: Readonly<{ children: ReactNode }>) {
  return <div className="admin-empty">{children}</div>;
}
