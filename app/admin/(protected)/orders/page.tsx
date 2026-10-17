import { updateOrderStatus } from "@/app/admin/actions";
import { AdminMutationForm } from "@/components/admin/admin-crud";
import { AdminEmpty, AdminPage } from "@/components/admin/admin-page";
import { requireAdmin } from "@/lib/auth/admin";
import type { Json } from "@/types/database";

function getNextFulfillmentStatus(status: string) {
  if (status === "unfulfilled") return "processing";
  if (status === "processing") return "shipped";
  if (status === "shipped") return "delivered";
  return null;
}

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

export default async function AdminOrdersPage() {
  const { supabase } = await requireAdmin();
  const { data: orders, error } = await supabase.from("orders")
    .select("id, order_number, status, fulfillment_status, fulfillment_hold, fulfillment_hold_reason, subtotal, shipping, discount, total, currency, customer_name, customer_email, customer_phone, shipping_information, created_at")
    .order("created_at", { ascending: false }).limit(100);
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

  return <AdminPage title="Pedidos" description="El pago se confirma exclusivamente desde Wompi; aquí se gestiona la preparación y envío.">
    {!orders.length ? <AdminEmpty>No hay pedidos visibles para esta sesión.</AdminEmpty> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>PEDIDO / FECHA</th><th>CLIENTE / ENTREGA</th><th>ARTÍCULOS</th><th>IMPORTE</th><th>PAGO</th><th>PREPARACIÓN</th></tr></thead><tbody>{orders.map((order) => {
      const items = itemsByOrder.get(order.id) ?? [];
      const payments = paymentsByOrder.get(order.id) ?? [];
      const nextFulfillment = getNextFulfillmentStatus(order.fulfillment_status);
      return <tr key={order.id}>
        <td><strong>{order.order_number}</strong><span>{new Date(order.created_at).toLocaleString("es-CO")}</span></td>
        <td><strong>{order.customer_name}</strong><span>{order.customer_email} · {order.customer_phone ?? "Sin celular"}</span><span>{getShippingAddress(order.shipping_information)}</span></td>
        <td><details><summary>{items.length} líneas</summary><ul>{items.map((item) => <li key={item.id}>{item.quantity} × {item.product_name} · {item.sku} · ${item.unit_price.toLocaleString("es-CO")}{getPersonalizationLabel(item.personalization)}</li>)}</ul></details></td>
        <td><strong>${order.total.toLocaleString("es-CO")} {order.currency}</strong><span>Envío ${order.shipping.toLocaleString("es-CO")} · Descuento ${order.discount.toLocaleString("es-CO")}</span></td>
        <td>{payments.length ? payments.map((payment, index) => <details key={payment.id} open={index === 0}><summary>{payment.status.toUpperCase()} · {payment.provider.toUpperCase()}</summary><span>Ref. {payment.reference ?? "—"}</span><span>{payment.transaction_id ?? "Transacción pendiente"}</span><span>{payment.environment ?? "—"} · ${payment.amount.toLocaleString("es-CO")} {payment.currency}</span></details>) : <span>SIN INTENTO</span>}</td>
        <td>{order.fulfillment_hold ? <span className="admin-status is-warning">REVISIÓN · {order.fulfillment_hold_reason}</span> : null}
          <strong>{order.fulfillment_status.toUpperCase()}</strong>
          {order.status === "paid" && nextFulfillment ? <AdminMutationForm action={updateOrderStatus.bind(null, order.id)} successMessage="Preparación actualizada." className="admin-select-form"><select name="status" defaultValue={nextFulfillment}><option value={nextFulfillment}>{nextFulfillment.toUpperCase()}</option></select><button type="submit" disabled={order.fulfillment_hold}>ACTUALIZAR</button></AdminMutationForm> : <span>Pedido: {order.status.toUpperCase()}</span>}
        </td>
      </tr>;
    })}</tbody></table></div>}
  </AdminPage>;
}
