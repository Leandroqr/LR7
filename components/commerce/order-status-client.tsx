"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { WompiCheckout } from "@/components/commerce/wompi-checkout";
import { useStore } from "@/components/providers/store-provider";
import { CHECKOUT_ATTEMPT_STORAGE_KEY, serializeCheckoutCart } from "@/lib/checkout/cart";
import { formatCurrency } from "@/lib/products";

type OrderItem = {
  id: string;
  product_name: string;
  sku: string;
  size: string | null;
  color: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
  personalization: { name?: string; number?: string };
};

type OrderStatusData = {
  order: {
    id: string;
    number: string;
    status: string;
    fulfillmentStatus: string;
    fulfillmentHold: boolean;
    fulfillmentHoldReason: string | null;
    subtotal: number;
    shipping: number;
    discount: number;
    total: number;
    currency: string;
    shippingInformation: Record<string, string>;
    createdAt: string;
    reservationExpiresAt: string | null;
    customer: { email: string; fullName: string; phone: string | null };
  };
  items: OrderItem[];
  payments: Array<{
    id: string;
    status: string;
    amount: number;
    currency: string;
    reference: string | null;
    transaction_id: string | null;
    environment: string | null;
    created_at: string;
  }>;
};

type PreparedCheckout = {
  order: { id: string; number: string; total: number };
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

function cartMatchesOrder(cart: ReturnType<typeof useStore>["cart"], items: OrderItem[]) {
  const current = serializeCheckoutCart(cart).map((item) => ({
    sku: item.sku,
    quantity: item.quantity,
    name: item.personalization.enabled ? item.personalization.name : "",
    number: item.personalization.enabled ? item.personalization.number : "",
  })).sort((left, right) => left.sku.localeCompare(right.sku));
  const persisted = items.map((item) => ({
    sku: item.sku,
    quantity: item.quantity,
    name: item.personalization.name ?? "",
    number: item.personalization.number ?? "",
  })).sort((left, right) => left.sku.localeCompare(right.sku));
  return JSON.stringify(current) === JSON.stringify(persisted);
}

function getOrderMessage(status: string, hold: boolean) {
  if (hold) return "Pago confirmado. El pedido requiere revisión de inventario antes de prepararlo; soporte te contactará.";
  if (status === "paid") return "Pago confirmado por Wompi. Tu pedido está registrado.";
  if (status === "payment_pending") return "Estamos esperando la confirmación de Wompi. No vuelvas a pagar mientras verificamos.";
  if (status === "pending") return "El pago aún no está confirmado. Puedes reintentar si Wompi rechazó la transacción.";
  if (status === "cancelled") return "El pedido está cancelado o la reserva expiró. No se confirmó el pago.";
  if (status === "refunded") return "El pedido figura como reembolsado.";
  return "Estado del pedido actualizado desde el servidor.";
}

function useOrderStatus(orderId: string, transactionId: string | null) {
  const [data, setData] = useState<OrderStatusData | null>(null);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [refreshCount, setRefreshCount] = useState(0);
  const reconciledReturn = useRef(false);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let pollCount = 0;

    async function updateStatus() {
      if (transactionId && !reconciledReturn.current) {
        reconciledReturn.current = true;
        await fetch("/api/payments/wompi/reconcile", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ orderId, transactionId }),
        }).catch(() => null);
      }
      const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}/status`, { cache: "no-store" });
      const result = await response.json().catch(() => null) as OrderStatusData | { error?: string } | null;
      if (!response.ok || !result || !("order" in result)) {
        throw new Error(result && "error" in result && result.error ? result.error : "No se pudo consultar el pedido.");
      }
      if (active) {
        setData(result);
        setError(undefined);
      }
      pollCount += 1;
      if (active && ["pending", "payment_pending"].includes(result.order.status) && pollCount < 36) {
        timer = setTimeout(updateStatus, 5000);
      }
    }

    async function start() {
      setLoading(true);
      try {
        await updateStatus();
      } catch (error_) {
        if (active) setError(error_ instanceof Error ? error_.message : "No se pudo consultar el pedido.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void start();
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [orderId, transactionId, refreshCount]);

  return { data, error, loading, refresh: () => setRefreshCount((count) => count + 1) };
}

async function requestRetryPayment(orderId: string) {
  const response = await fetch("/api/payments/wompi/prepare", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ retryOrderId: orderId, attemptKey: crypto.randomUUID() }),
  });
  const result = await response.json().catch(() => null) as PreparedCheckout | { error?: string } | null;
  if (!response.ok || !result || !("checkout" in result)) {
    throw new Error(result && "error" in result && result.error ? result.error : "No se pudo reintentar el pago.");
  }
  return result;
}

function OrderItemList({ items }: Readonly<{ items: OrderItem[] }>) {
  return <section className="order-status-section"><h2>ARTÍCULOS</h2><ul>{items.map((item) => <li key={item.id}>
    <span>{item.quantity} × {item.product_name} · {item.size ?? ""}{item.color ? ` / ${item.color}` : ""}</span>
    <strong>${formatCurrency(item.line_total)}</strong>
    {item.personalization.name || item.personalization.number ? <small>{item.personalization.name} {item.personalization.number ? `#${item.personalization.number}` : ""}</small> : null}
  </li>)}</ul></section>;
}

function PaymentList({ payments }: Readonly<{ payments: OrderStatusData["payments"] }>) {
  return <section className="order-status-section"><h2>PAGO</h2>{payments.map((payment) => <dl key={payment.id}>
    <div><dt>Estado</dt><dd>{payment.status.toUpperCase()}</dd></div>
    <div><dt>Referencia</dt><dd>{payment.reference ?? "—"}</dd></div>
    <div><dt>Transacción Wompi</dt><dd>{payment.transaction_id ?? "Pendiente"}</dd></div>
    <div><dt>Importe</dt><dd>${formatCurrency(payment.amount)} {payment.currency}</dd></div>
  </dl>)}</section>;
}

function OrderTotals({ data }: Readonly<{ data: OrderStatusData }>) {
  return <section className="order-status-section">
    <h2>ENTREGA Y TOTAL</h2>
    <p>{data.order.customer.fullName} · {data.order.customer.email}</p>
    <p>{data.order.shippingInformation.address_line_1}, {data.order.shippingInformation.city}, {data.order.shippingInformation.department}</p>
    <dl>
      <div><dt>Subtotal</dt><dd>${formatCurrency(data.order.subtotal)}</dd></div>
      <div><dt>Envío</dt><dd>${formatCurrency(data.order.shipping)}</dd></div>
      {data.order.discount ? <div><dt>Descuento</dt><dd>-${formatCurrency(data.order.discount)}</dd></div> : null}
      <div><dt>Total</dt><dd>${formatCurrency(data.order.total)} {data.order.currency}</dd></div>
    </dl>
  </section>;
}

function OrderStatusDetails({ data, retrying, retryCheckout, canRetry, onRetry, onRetryTransaction, onRefresh, loading }: Readonly<{
  data: OrderStatusData;
  retrying: boolean;
  retryCheckout: PreparedCheckout | null;
  canRetry: boolean;
  onRetry: () => void;
  onRetryTransaction: (transaction: { id?: string }) => void;
  onRefresh: () => void;
  loading: boolean;
}>) {
  return <>
    <section className="order-status-message" aria-live="polite">
      <h2>{data.order.status.replaceAll("_", " ").toUpperCase()}</h2>
      <p>{getOrderMessage(data.order.status, data.order.fulfillmentHold)}</p>
    </section>
    {data.order.fulfillmentHoldReason ? <p role="alert">{data.order.fulfillmentHoldReason}</p> : null}
    <OrderItemList items={data.items} />
    <PaymentList payments={data.payments} />
    <OrderTotals data={data} />
    {retryCheckout ? <section className="order-status-retry"><h2>REINTENTAR PAGO</h2><WompiCheckout {...retryCheckout.checkout} onTransaction={onRetryTransaction} /></section> : null}
    {canRetry && !retryCheckout ? <button type="button" className="cart-checkout-button" onClick={onRetry} disabled={retrying}>{retrying ? "PREPARANDO..." : "REINTENTAR PAGO"}</button> : null}
    <button type="button" className="order-status-refresh" onClick={onRefresh} disabled={loading}>ACTUALIZAR ESTADO</button>
  </>;
}

function OrderStatusView({ data, error, retryError, loading, retrying, retryCheckout, canRetry, onRetry, onRetryTransaction, onRefresh }: Readonly<{
  data: OrderStatusData | null;
  error?: string;
  retryError?: string;
  loading: boolean;
  retrying: boolean;
  retryCheckout: PreparedCheckout | null;
  canRetry: boolean;
  onRetry: () => void;
  onRetryTransaction: (transaction: { id?: string }) => void;
  onRefresh: () => void;
}>) {
  return <main className="order-status-page"><div className="order-status-container">
    <p className="order-status-eyebrow">LR7 · ESTADO DE PEDIDO</p>
    <h1>{data ? `PEDIDO ${data.order.number}` : "CONSULTANDO PEDIDO"}</h1>
    {loading && !data ? <p aria-busy="true">Consultando el estado confirmado…</p> : null}
    {error ? <p className="checkout-feedback is-error" role="alert">{error}</p> : null}
    {retryError ? <p className="checkout-feedback is-error" role="alert">{retryError}</p> : null}
    {data ? <OrderStatusDetails data={data} retrying={retrying} retryCheckout={retryCheckout} canRetry={canRetry} onRetry={onRetry} onRetryTransaction={onRetryTransaction} onRefresh={onRefresh} loading={loading} /> : null}
    <Link href="/tienda" className="order-status-store-link">VOLVER A LA TIENDA</Link>
  </div></main>;
}

export function OrderStatusClient({ orderId, transactionId }: Readonly<{ orderId: string; transactionId: string | null }>) {
  const { cart, clearCart } = useStore();
  const { data, error, loading, refresh } = useOrderStatus(orderId, transactionId);
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string>();
  const [retryCheckout, setRetryCheckout] = useState<PreparedCheckout | null>(null);
  const cartCleared = useRef(false);
  const latestPayment = data?.payments[0];
  const canRetry = data?.order.status === "pending" && ["rejected", "cancelled"].includes(latestPayment?.status ?? "");

  useEffect(() => {
    if (data?.order.status === "cancelled") {
      localStorage.removeItem(CHECKOUT_ATTEMPT_STORAGE_KEY);
    }
    if (data?.order.status === "paid" && !cartCleared.current && cartMatchesOrder(cart, data.items)) {
      cartCleared.current = true;
      clearCart();
      localStorage.removeItem(CHECKOUT_ATTEMPT_STORAGE_KEY);
    }
  }, [cart, clearCart, data]);

  async function retryPayment() {
    if (!data || retrying) return;
    setRetrying(true);
    setRetryError(undefined);
    try {
      setRetryCheckout(await requestRetryPayment(data.order.id));
    } catch (error_) {
      setRetryError(error_ instanceof Error ? error_.message : "No se pudo reintentar el pago.");
    } finally {
      setRetrying(false);
    }
  }

  async function onRetryTransaction(transaction: { id?: string }) {
    if (transaction.id) {
      const response = await fetch("/api/payments/wompi/reconcile", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderId, transactionId: transaction.id }),
      }).catch(() => null);
      if (!response?.ok) setRetryError("No se pudo conciliar ahora; el pedido seguirá consultándose desde el servidor.");
    }
    setRetryCheckout(null);
    refresh();
  }

  return <OrderStatusView data={data} error={error} retryError={retryError} loading={loading} retrying={retrying} retryCheckout={retryCheckout} canRetry={canRetry} onRetry={retryPayment} onRetryTransaction={onRetryTransaction} onRefresh={refresh} />;
}
