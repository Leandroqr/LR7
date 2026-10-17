"use client";

import { useRef, useState, type SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import { WompiCheckout } from "@/components/commerce/wompi-checkout";
import { type CartItem } from "@/components/providers/store-provider";
import { CHECKOUT_ATTEMPT_STORAGE_KEY, serializeCheckoutCart } from "@/lib/checkout/cart";
import { formatCurrency } from "@/lib/products";

type PreparedCheckout = {
  order: {
    id: string;
    number: string;
    status: string;
    subtotal: number;
    shipping: number;
    discount: number;
    total: number;
    currency: "COP";
  };
  checkout: {
    publicKey: string;
    reference: string;
    amountInCents: number;
    currency: "COP";
    signature: string;
    redirectUrl: string;
    customerData: { email: string; fullName: string; phoneNumber: string; phoneNumberPrefix: "+57" };
    shippingAddress: { addressLine1: string; addressLine2?: string; city: string; region: string; country: "CO"; phoneNumber: string; name: string };
  };
};

function formatCartFingerprint(value: string) {
  return crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)).then((buffer) =>
    Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, "0")).join(""),
  );
}

function getCheckoutKeys(fingerprint: string) {
  try {
    const stored = localStorage.getItem(CHECKOUT_ATTEMPT_STORAGE_KEY)?.split(":") ?? [];
    if (stored.length === 3 && stored[0] === fingerprint) {
      return { idempotencyKey: stored[1], attemptKey: stored[2] };
    }
    const keys = { idempotencyKey: crypto.randomUUID(), attemptKey: crypto.randomUUID() };
    localStorage.setItem(CHECKOUT_ATTEMPT_STORAGE_KEY, `${fingerprint}:${keys.idempotencyKey}:${keys.attemptKey}`);
    return keys;
  } catch {
    return { idempotencyKey: crypto.randomUUID(), attemptKey: crypto.randomUUID() };
  }
}

function formText(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export function CheckoutPanel({ cart }: Readonly<{ cart: CartItem[] }>) {
  const router = useRouter();
  const [prepared, setPrepared] = useState<PreparedCheckout | null>(null);
  const [error, setError] = useState<string>();
  const [isPending, setIsPending] = useState(false);
  const pendingRef = useRef(false);

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pendingRef.current || cart.length === 0) return;
    pendingRef.current = true;
    setIsPending(true);
    setError(undefined);
    const form = event.currentTarget;
    try {
      const formData = new FormData(form);
      const requestBody = {
        items: serializeCheckoutCart(cart),
        customer: {
          email: formText(formData, "email"),
          fullName: formText(formData, "full_name"),
          phone: normalizeColombianPhone(formText(formData, "phone")),
        },
        shipping: {
          addressLine1: formText(formData, "address_line_1"),
          addressLine2: formText(formData, "address_line_2"),
          city: formText(formData, "city"),
          region: formText(formData, "region"),
          postalCode: formText(formData, "postal_code"),
        },
        couponCode: formText(formData, "coupon_code"),
      };
      const fingerprint = await formatCartFingerprint(JSON.stringify({ items: requestBody.items, couponCode: requestBody.couponCode }));
      const keys = getCheckoutKeys(fingerprint);
      const response = await fetch("/api/payments/wompi/prepare", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...requestBody, ...keys }),
      });
      const result = await response.json().catch(() => null) as PreparedCheckout | { error?: string; resumeOrderId?: unknown } | null;
      if (response.status === 409 && result && "resumeOrderId" in result && typeof result.resumeOrderId === "string" && /^[0-9a-f-]{36}$/i.test(result.resumeOrderId)) {
        router.push(`/checkout/estado/${result.resumeOrderId}`);
        return;
      }
      if (!response.ok || !result || !("order" in result)) {
        throw new Error(result && "error" in result && result.error ? result.error : "No se pudo preparar el pago.");
      }
      setPrepared(result);
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : "No se pudo preparar el pedido.");
    } finally {
      pendingRef.current = false;
      setIsPending(false);
    }
  }

  async function onTransaction(transaction: { id?: string }) {
    if (!prepared || !transaction.id) {
      if (prepared) router.push(`/checkout/estado/${prepared.order.id}`);
      return;
    }
    try {
      await fetch("/api/payments/wompi/reconcile", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderId: prepared.order.id, transactionId: transaction.id }),
      });
    } catch {
      // El webhook o la consulta de estado completarán la confirmación.
    }
    router.push(`/checkout/estado/${prepared.order.id}`);
  }

  return <>
    <form id="lr7-checkout-form" className="checkout-panel checkout-form" onSubmit={submit} aria-busy={isPending} hidden={Boolean(prepared)}>
      <h2>DATOS PARA TU PEDIDO</h2>
      <div className="checkout-form-grid">
        <label><span>NOMBRE COMPLETO</span><input name="full_name" autoComplete="name" minLength={2} maxLength={160} required disabled={isPending} /></label>
        <label><span>CORREO</span><input name="email" type="email" autoComplete="email" maxLength={254} required disabled={isPending} /></label>
        <label><span>CELULAR COLOMBIANO</span><input name="phone" type="tel" inputMode="tel" autoComplete="tel" minLength={10} maxLength={16} placeholder="3001234567 o +57 3001234567" required disabled={isPending} /></label>
        <label className="checkout-form-wide"><span>DIRECCIÓN</span><input name="address_line_1" autoComplete="address-line1" minLength={5} maxLength={180} required disabled={isPending} /></label>
        <label className="checkout-form-wide"><span>APARTAMENTO / REFERENCIA</span><input name="address_line_2" autoComplete="address-line2" maxLength={180} disabled={isPending} /></label>
        <label><span>CIUDAD</span><input name="city" autoComplete="address-level2" minLength={2} maxLength={100} required disabled={isPending} /></label>
        <label><span>DEPARTAMENTO</span><input name="region" autoComplete="address-level1" minLength={2} maxLength={100} required disabled={isPending} /></label>
        <label><span>CÓDIGO POSTAL</span><input name="postal_code" autoComplete="postal-code" maxLength={20} disabled={isPending} /></label>
        <label><span>CUPÓN</span><input name="coupon_code" autoComplete="off" maxLength={80} disabled={isPending} /></label>
      </div>
      {error ? <p className="checkout-feedback is-error" role="alert">{error}</p> : null}
      <button type="submit" className="cart-checkout-button" disabled={isPending || cart.length === 0}>
        {isPending ? "VALIDANDO PEDIDO..." : "CONTINUAR AL PAGO"}
      </button>
      <p className="checkout-server-note">El precio, el stock, el descuento y el envío se confirman en el servidor antes de abrir Wompi.</p>
    </form>
    {prepared ? (
      <section className="checkout-panel" aria-labelledby="checkout-prepared-title">
        <h2 id="checkout-prepared-title">PEDIDO {prepared.order.number}</h2>
        <div className="checkout-server-total">
          <span>Total confirmado por LR7</span>
          <strong>${formatCurrency(prepared.order.total)} COP</strong>
        </div>
        <dl className="checkout-server-breakdown">
          <div><dt>Subtotal</dt><dd>${formatCurrency(prepared.order.subtotal)}</dd></div>
          <div><dt>Envío</dt><dd>${formatCurrency(prepared.order.shipping)}</dd></div>
          {prepared.order.discount ? <div><dt>Descuento</dt><dd>-${formatCurrency(prepared.order.discount)}</dd></div> : null}
        </dl>
        <WompiCheckout {...prepared.checkout} onTransaction={onTransaction} />
        <button type="button" className="checkout-edit-details" onClick={() => setPrepared(null)}>EDITAR DATOS DE ENTREGA</button>
      </section>
    ) : null}
  </>;
}

function normalizeColombianPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.startsWith("57") && digits.length === 12 ? digits.slice(2) : digits;
}
