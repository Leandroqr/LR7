import Link from "next/link";
import { updateOrderStatus } from "@/app/admin/actions";
import { AdminMutationForm } from "@/components/admin/admin-crud";
import { AdminEmpty, AdminFilters, AdminPage, AdminResultCount } from "@/components/admin/admin-page";
import { firstParam, pickOption, sanitizeAdminSearch } from "@/lib/admin/search";
import { requireAdmin } from "@/lib/auth/admin";
import type { Json } from "@/types/database";

const ORDER_LIMIT = 100;
const ORDER_FILTERS = ["all", "to_fulfill", "awaiting_payment", "completed", "closed"] as const;

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  payment_pending: "Esperando pago",
  paid: "Pagado",
  processing: "En proceso",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
};

const FULFILLMENT_LABELS: Record<string, string> = {
  unfulfilled: "Sin preparar",
  processing: "En preparación",
  shipped: "Enviado",
  delivered: "Entregado",
};

const NEXT_FULFILLMENT_ACTION: Record<string, { status: string; label: string }> = {
  unfulfilled: { status: "processing", label: "EMPEZAR PREPARACIÓN" },
  processing: { status: "shipped", label: "MARCAR COMO ENVIADO" },
  shipped: { status: "delivered", label: "MARCAR COMO ENTREGADO" },
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  approved: "Aprobado",
  rejected: "Rechazado",
  cancelled: "Anulado",
  refunded: "Reembolsado",
};

const money = (amount: number) => `$${amount.toLocaleString("es-CO")}`;

function getPersonalizationLabel(value: Json) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "";
  const name = typeof value.name === "string" ? value.name : "";
  const number = typeof value.number === "string" ? value.number : "";
  if (!name && !number) return "";
  const label = [name, number ? `#${number}` : ""].filter(Boolean).join(" ");
  return ` · ${label}`;
}

function getShippingAddress(value: Json) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "Dirección no disponible";
  const address = typeof value.address_line_1 === "string" ? value.address_line_1 : "";
  const city = typeof value.city === "string" ? value.city : "";
  const department = typeof value.department === "string" ? value.department : "";
  return [address, city, department].filter(Boolean).join(", ") || "Dirección no disponible";
}

type OrdersPageProps = Readonly<{ searchParams: Promise<Record<string, string | string[] | undefined>> }>;

export default async function AdminOrdersPage({ searchParams }: OrdersPageProps) {
  const params = await searchParams;
  const q = sanitizeAdminSearch(firstParam(params.q));
  const filter = pickOption(firstParam(params.estado), ORDER_FILTERS, "all");
  const { supabase } = await requireAdmin();

  let query = supabase.from("orders")
    .select("id, order_number, status, fulfillment_status, fulfillment_hold, fulfillment_hold_reason, subtotal, shipping, discount, total, currency, customer_name, customer_email, customer_phone, shipping_information, created_at")
    .order("created_at", { ascending: false })
    .limit(ORDER_LIMIT);
  if (q) query = query.or(`order_number.ilike.*${q}*,customer_email.ilike.*${q}*,customer_name.ilike.*${q}*`);
  if (filter === "to_fulfill") query = query.eq("status", "paid").in("fulfillment_status", ["unfulfilled", "processing", "shipped"]);
  if (filter === "awaiting_payment") query = query.in("status", ["pending", "payment_pending"]);
  if (filter === "completed") query = query.eq("status", "paid").eq("fulfillment_status", "delivered");
  if (filter === "closed") query = query.in("status", ["cancelled", "refunded"]);
  const { data: orders, error } = await query;
  if (error) throw new Error(error.message);

  const orderIds = orders.map((order) => order.id);
  const [itemResult, paymentResult] = orderIds.length ? await Promise.all([
    supabase.from("order_items").select("id, order_id, product_name, sku, size, color, quantity, unit_price, line_total, personalization").in("order_id", orderIds),
    supabase.from("payments").select("id, order_id, provider, transaction_id, status, amount, currency, reference, environment, created_at").in("order_id", orderIds).order("created_at", { ascending: false }),
  ]) : [{ data: [], error: null }, { data: [], error: null }];
  const queryError = itemResult.error ?? paymentResult.error;
  if (queryError) throw new Error("No se pudieron cargar los detalles financieros del pedido.");

  const itemsByOrder = new Map<string, typeof itemResult.data>();
  for (const item of itemResult.data ?? []) itemsByOrder.set(item.order_id, [...(itemsByOrder.get(item.order_id) ?? []), item]);
  const paymentsByOrder = new Map<string, NonNullable<typeof paymentResult.data>>();
  for (const payment of paymentResult.data ?? []) paymentsByOrder.set(payment.order_id, [...(paymentsByOrder.get(payment.order_id) ?? []), payment]);
  const filtered = Boolean(q) || filter !== "all";

  return <AdminPage title="Pedidos" description="El pago se confirma exclusivamente desde Wompi; aquí se gestiona la preparación y el envío.">
    <AdminFilters resetHref="/admin/orders" active={filtered}>
      <label><span>BUSCAR</span><input name="q" type="search" defaultValue={q} placeholder="Nº de pedido, nombre o correo" /></label>
      <label><span>ESTADO</span><select name="estado" defaultValue={filter}>
        <option value="all">Todos</option>
        <option value="to_fulfill">Pagados por preparar/enviar</option>
        <option value="awaiting_payment">Esperando pago</option>
        <option value="completed">Entregados</option>
        <option value="closed">Cancelados o reembolsados</option>
      </select></label>
    </AdminFilters>
    {!orders.length ? <AdminEmpty action={filtered ? <Link href="/admin/orders">Limpiar filtros</Link> : undefined}>{filtered ? "Ningún pedido coincide con los filtros." : "Todavía no hay pedidos. Aparecerán aquí cuando se active el checkout."}</AdminEmpty> : <>
      <AdminResultCount shown={orders.length} noun="pedidos" limit={ORDER_LIMIT} />
      <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th scope="col">PEDIDO / FECHA</th><th scope="col">CLIENTE / ENTREGA</th><th scope="col">ARTÍCULOS</th><th scope="col">IMPORTE</th><th scope="col">PAGO</th><th scope="col">PREPARACIÓN</th></tr></thead><tbody>{orders.map((order) => {
        const items = itemsByOrder.get(order.id) ?? [];
        const payments = paymentsByOrder.get(order.id) ?? [];
        const nextAction = order.status === "paid" ? NEXT_FULFILLMENT_ACTION[order.fulfillment_status] : undefined;
        return <tr key={order.id}>
          <td><strong>{order.order_number}</strong><span>{new Date(order.created_at).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}</span><span className={`admin-status ${order.status === "paid" ? "is-active" : order.status === "cancelled" || order.status === "refunded" ? "is-danger" : ""}`}>{(ORDER_STATUS_LABELS[order.status] ?? order.status).toUpperCase()}</span></td>
          <td><strong>{order.customer_name}</strong><span><a href={`mailto:${order.customer_email}`}>{order.customer_email}</a> · {order.customer_phone ?? "Sin celular"}</span><span>{getShippingAddress(order.shipping_information)}</span></td>
          <td><details><summary>{items.length} {items.length === 1 ? "línea" : "líneas"}</summary><ul>{items.map((item) => <li key={item.id}>{item.quantity} × {item.product_name} · {item.size}{item.color ? `/${item.color}` : ""} · {item.sku} · {money(item.unit_price)}{getPersonalizationLabel(item.personalization)}</li>)}</ul></details></td>
          <td><strong>{money(order.total)} {order.currency}</strong><span>Subtotal {money(order.subtotal)} · Envío {money(order.shipping)} · Descuento {money(order.discount)}</span></td>
          <td>{payments.length ? payments.map((payment, index) => <details key={payment.id} open={index === 0}><summary>{(PAYMENT_STATUS_LABELS[payment.status.toLowerCase()] ?? payment.status).toUpperCase()} · {payment.provider.toUpperCase()}</summary><span>Ref. {payment.reference ?? "—"}</span><span>{payment.transaction_id ?? "Transacción pendiente"}</span><span>{payment.environment ?? "—"} · {money(payment.amount)} {payment.currency}</span></details>) : <span>Sin intento de pago</span>}</td>
          <td>
            {order.fulfillment_hold ? <span className="admin-status is-warning">RETENIDO · {order.fulfillment_hold_reason ?? "revisión"}</span> : null}
            <strong>{(FULFILLMENT_LABELS[order.fulfillment_status] ?? order.fulfillment_status).toUpperCase()}</strong>
            {nextAction ? (
              <AdminMutationForm action={updateOrderStatus.bind(null, order.id)} successMessage={`Pedido ${order.order_number}: ${FULFILLMENT_LABELS[nextAction.status].toLowerCase()}.`} className="admin-select-form">
                <input type="hidden" name="status" value={nextAction.status} />
                <button type="submit" disabled={order.fulfillment_hold} title={order.fulfillment_hold ? "Resuelve la retención antes de continuar" : undefined}>{nextAction.label}</button>
              </AdminMutationForm>
            ) : order.status !== "paid" ? <span>Disponible cuando el pago esté aprobado.</span> : null}
          </td>
        </tr>;
      })}</tbody></table></div>
    </>}
  </AdminPage>;
}
