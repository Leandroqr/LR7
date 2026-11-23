export default function AdminLoading() {
  return (
    <main className="admin-page" aria-busy="true">
      <header className="admin-page-header">
        <div>
          <p>LR7 / ADMIN</p>
          <div className="admin-skeleton admin-skeleton-title" />
        </div>
      </header>
      <p className="admin-visually-hidden" role="status">Cargando datos…</p>
      <div className="admin-skeleton admin-skeleton-block" />
    </main>
  );
}
