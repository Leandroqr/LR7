"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
  type ReactNode,
  type SubmitEvent,
} from "react";
import { useRouter } from "next/navigation";
import { getAdminActionData, isAdminActionFailure } from "@/lib/admin/action-result";

type FormAction = (formData: FormData) => unknown;

const TOAST_EVENT = "lr7-admin:toast";
const DISCARD_MESSAGE = "Hay cambios sin guardar. ¿Quieres descartarlos?";

type ToastDetail = { message: string; tone: "success" | "error" };

export function showAdminToast(message: string, tone: ToastDetail["tone"] = "success") {
  window.dispatchEvent(new CustomEvent<ToastDetail>(TOAST_EVENT, { detail: { message, tone } }));
}

/** Single polite live region for confirmations that outlive the form that triggered them. */
export function AdminToastRegion() {
  const [toasts, setToasts] = useState<Array<ToastDetail & { id: number }>>([]);

  useEffect(() => {
    let nextId = 0;
    const timers = new Set<ReturnType<typeof setTimeout>>();
    function onToast(event: Event) {
      const { detail } = event as CustomEvent<ToastDetail>;
      const id = ++nextId;
      setToasts((current) => [...current.slice(-2), { ...detail, id }]);
      const timer = setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
        timers.delete(timer);
      }, 4000);
      timers.add(timer);
    }
    window.addEventListener(TOAST_EVENT, onToast);
    return () => {
      window.removeEventListener(TOAST_EVENT, onToast);
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="admin-toasts" role="status" aria-live="polite">
      {toasts.map((toast) => <p key={toast.id} className={`admin-toast is-${toast.tone}`}>{toast.message}</p>)}
    </div>
  );
}

type DialogContextValue = { close: (force?: boolean) => void; setDirty: (dirty: boolean) => void };
const DialogContext = createContext<DialogContextValue | null>(null);

/**
 * Native modal dialog: showModal() gives focus trapping, inert background and Escape.
 * Focus returns to the trigger on close, and unsaved edits ask before being discarded.
 */
export function AdminDialog({ label, title, children, triggerClassName = "admin-primary" }: Readonly<{ label: string; title: string; children: ReactNode; triggerClassName?: string }>) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dirtyRef = useRef(false);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && dialog && !dialog.open) dialog.showModal();
  }, [open]);

  const close = useCallback((force = false) => {
    if (!force && dirtyRef.current && !window.confirm(DISCARD_MESSAGE)) return;
    dirtyRef.current = false;
    dialogRef.current?.close();
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  const setDirty = useCallback((dirty: boolean) => {
    dirtyRef.current = dirty;
  }, []);

  return (
    <>
      <button ref={triggerRef} type="button" className={triggerClassName} aria-haspopup="dialog" onClick={() => setOpen(true)}>{label}</button>
      {open ? (
        <dialog
          ref={dialogRef}
          className="admin-dialog"
          aria-labelledby={titleId}
          onCancel={(event) => {
            event.preventDefault();
            close();
          }}
          onClick={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <div className="admin-dialog-body">
            <header>
              <h2 id={titleId}>{title}</h2>
              <button type="button" className="admin-icon-button" aria-label="Cerrar" onClick={() => close()}>×</button>
            </header>
            <DialogContext.Provider value={{ close, setDirty }}>{children}</DialogContext.Provider>
          </div>
        </dialog>
      ) : null}
    </>
  );
}

export function AdminMutationForm({
  action,
  successMessage = "Cambios guardados.",
  className,
  onSuccess,
  resetOnSuccess = false,
  children,
}: Readonly<{
  action: FormAction;
  successMessage?: string;
  className?: string;
  onSuccess?: (data: unknown) => void;
  resetOnSuccess?: boolean;
  children: ReactNode;
}>) {
  const [error, setError] = useState<string>();
  const [dirty, setDirtyState] = useState(false);
  const [isPending, startTransition] = useTransition();
  const pendingRef = useRef(false);
  const router = useRouter();
  const dialog = useContext(DialogContext);
  const errorId = useId();

  const markDirty = useCallback((next: boolean) => {
    setDirtyState(next);
    dialog?.setDirty(next);
  }, [dialog]);

  // Leaving the page (reload, tab close) with pending edits outside a dialog asks first.
  useEffect(() => {
    if (!dirty || dialog) return;
    function onBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty, dialog]);

  function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pendingRef.current) return;
    pendingRef.current = true;
    const form = event.currentTarget;
    setError(undefined);
    startTransition(async () => {
      try {
        const result = await action(new FormData(form));
        if (isAdminActionFailure(result)) {
          setError(result.error);
          return;
        }
        markDirty(false);
        if (resetOnSuccess) form.reset();
        if (onSuccess) onSuccess(getAdminActionData(result));
        else router.refresh();
        showAdminToast(successMessage);
        dialog?.close(true);
      } catch {
        setError("No fue posible guardar los cambios. Revisa tu conexión e inténtalo de nuevo.");
      } finally {
        pendingRef.current = false;
      }
    });
  }

  return <form onSubmit={submit} onInput={() => { if (!dirty) markDirty(true); }} className={className} aria-busy={isPending} aria-describedby={error ? errorId : undefined}>
    <fieldset className="admin-mutation-controls" disabled={isPending}>{children}</fieldset>
    {isPending ? <output className="admin-form-feedback is-loading">Guardando cambios...</output> : null}
    {error ? <p id={errorId} className="admin-form-feedback is-error" role="alert">{error}</p> : null}
  </form>;
}

export function AdminConfirmAction({ action, label = "Eliminar", itemName, successMessage = "Eliminado correctamente.", redirectTo }: Readonly<{ action: FormAction; label?: string; itemName: string; successMessage?: string; redirectTo?: string }>) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && dialog && !dialog.open) dialog.showModal();
  }, [open]);

  function close() {
    if (isPending) return;
    dialogRef.current?.close();
    setOpen(false);
    setError(undefined);
    triggerRef.current?.focus();
  }

  function confirm() {
    setError(undefined);
    startTransition(async () => {
      try {
        const result = await action(new FormData());
        if (isAdminActionFailure(result)) {
          setError(result.error);
          return;
        }
        dialogRef.current?.close();
        setOpen(false);
        showAdminToast(successMessage);
        if (redirectTo) router.replace(redirectTo);
        else router.refresh();
      } catch {
        setError("No fue posible eliminar el registro. Revisa tu conexión e inténtalo de nuevo.");
      }
    });
  }

  return <>
    <button ref={triggerRef} type="button" className="admin-danger-text" aria-haspopup="dialog" onClick={() => setOpen(true)}>{label}</button>
    {open ? (
      <dialog
        ref={dialogRef}
        className="admin-confirm"
        aria-labelledby={titleId}
        onCancel={(event) => {
          event.preventDefault();
          close();
        }}
      >
        <div className="admin-dialog-body">
          <h2 id={titleId}>¿Eliminar {itemName}?</h2>
          <p>Esta acción no se puede deshacer.</p>
          {error ? <p className="admin-form-feedback is-error" role="alert">{error}</p> : null}
          <div className="admin-confirm-actions">
            <button type="button" className="admin-secondary" onClick={close} disabled={isPending} autoFocus>Cancelar</button>
            <button type="button" className="admin-danger" onClick={confirm} disabled={isPending}>{isPending ? "Eliminando..." : "Eliminar"}</button>
          </div>
        </div>
      </dialog>
    ) : null}
  </>;
}
