"use client";

import { useState, useTransition, type FormEvent, type ReactNode } from "react";

type FormAction = (formData: FormData) => void | Promise<void>;

export function AdminDialog({ label, title, children }: Readonly<{ label: string; title: string; children: ReactNode }>) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className="admin-primary" onClick={() => setOpen(true)}>{label}</button>
      {open ? <div className="admin-dialog-backdrop" role="presentation" onMouseDown={() => setOpen(false)}>
        <section className="admin-dialog" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()}>
          <header><h2>{title}</h2><button type="button" className="admin-icon-button" aria-label="Cerrar" onClick={() => setOpen(false)}>×</button></header>
          {children}
        </section>
      </div> : null}
    </>
  );
}

export function AdminMutationForm({ action, successMessage = "Cambios guardados.", className, children }: Readonly<{ action: FormAction; successMessage?: string; className?: string; children: ReactNode }>) {
  const [message, setMessage] = useState<string>();
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setMessage(undefined);
    setError(undefined);
    startTransition(async () => {
      try {
        await action(new FormData(form));
        setMessage(successMessage);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "No fue posible guardar los cambios.");
      }
    });
  }

  return <form onSubmit={submit} className={className} aria-busy={isPending}>
    {children}
    {isPending ? <p className="admin-form-feedback is-loading">Guardando cambios...</p> : null}
    {message ? <p className="admin-form-feedback is-success" role="status">{message}</p> : null}
    {error ? <p className="admin-form-feedback is-error" role="alert">{error}</p> : null}
  </form>;
}

export function AdminConfirmAction({ action, label = "Eliminar", itemName }: Readonly<{ action: FormAction; label?: string; itemName: string }>) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  function confirm() {
    setError(undefined);
    startTransition(async () => {
      try {
        await action(new FormData());
        setOpen(false);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "No fue posible eliminar el registro.");
      }
    });
  }

  return <>
    <button type="button" className="admin-danger-text" onClick={() => setOpen(true)}>{label}</button>
    {open ? <div className="admin-dialog-backdrop" role="presentation" onMouseDown={() => setOpen(false)}>
      <section className="admin-confirm" role="alertdialog" aria-modal="true" aria-label={`Eliminar ${itemName}`} onMouseDown={(event) => event.stopPropagation()}>
        <h2>¿Eliminar {itemName}?</h2><p>Esta acción no se puede deshacer.</p>
        {error ? <p className="admin-form-feedback is-error" role="alert">{error}</p> : null}
        <div><button type="button" className="admin-secondary" onClick={() => setOpen(false)}>Cancelar</button><button type="button" className="admin-danger" onClick={confirm} disabled={isPending}>{isPending ? "Eliminando..." : "Eliminar"}</button></div>
      </section>
    </div> : null}
  </>;
}