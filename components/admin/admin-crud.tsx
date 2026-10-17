"use client";

import { useRef, useState, useTransition, type ReactNode, type SubmitEvent } from "react";
import { useRouter } from "next/navigation";

type FormAction = (formData: FormData) => unknown;

export function AdminDialog({ label, title, children }: Readonly<{ label: string; title: string; children: ReactNode }>) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className="admin-primary" onClick={() => setOpen(true)}>{label}</button>
      {open ? <div className="admin-dialog-backdrop">
        <dialog open className="admin-dialog" aria-modal="true" aria-label={title}>
          <header><h2>{title}</h2><button type="button" className="admin-icon-button" aria-label="Cerrar" onClick={() => setOpen(false)}>×</button></header>
          {children}
        </dialog>
      </div> : null}
    </>
  );
}

export function AdminMutationForm({ action, successMessage = "Cambios guardados.", className, onSuccess, children }: Readonly<{ action: FormAction; successMessage?: string; className?: string; onSuccess?: (result: unknown) => void; children: ReactNode }>) {
  const [message, setMessage] = useState<string>();
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const pendingRef = useRef(false);
  const router = useRouter();

  function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pendingRef.current) return;
    pendingRef.current = true;
    const form = event.currentTarget;
    setMessage(undefined);
    setError(undefined);
    startTransition(async () => {
      try {
        const result = await action(new FormData(form));
        if (onSuccess) onSuccess(result);
        else router.refresh();
        setMessage(successMessage);
      } catch (error_) {
        setError(error_ instanceof Error ? error_.message : "No fue posible guardar los cambios.");
      } finally {
        pendingRef.current = false;
      }
    });
  }

  return <form onSubmit={submit} className={className} aria-busy={isPending}>
    <fieldset className="admin-mutation-controls" disabled={isPending}>{children}</fieldset>
    {isPending ? <output className="admin-form-feedback is-loading">Guardando cambios...</output> : null}
    {message ? <output className="admin-form-feedback is-success" aria-live="polite">{message}</output> : null}
    {error ? <p className="admin-form-feedback is-error" role="alert">{error}</p> : null}
  </form>;
}

export function AdminConfirmAction({ action, label = "Eliminar", itemName }: Readonly<{ action: FormAction; label?: string; itemName: string }>) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function confirm() {
    setError(undefined);
    startTransition(async () => {
      try {
        await action(new FormData());
        setOpen(false);
        router.refresh();
      } catch (error_) {
        setError(error_ instanceof Error ? error_.message : "No fue posible eliminar el registro.");
      }
    });
  }

  return <>
    <button type="button" className="admin-danger-text" onClick={() => setOpen(true)}>{label}</button>
    {open ? <div className="admin-dialog-backdrop">
      <dialog open className="admin-confirm" aria-modal="true" aria-label={`Eliminar ${itemName}`}>
        <h2>¿Eliminar {itemName}?</h2><p>Esta acción no se puede deshacer.</p>
        {error ? <p className="admin-form-feedback is-error" role="alert">{error}</p> : null}
        <div><button type="button" className="admin-secondary" onClick={() => setOpen(false)} disabled={isPending}>Cancelar</button><button type="button" className="admin-danger" onClick={confirm} disabled={isPending}>{isPending ? "Eliminando..." : "Eliminar"}</button></div>
      </dialog>
    </div> : null}
  </>;
}