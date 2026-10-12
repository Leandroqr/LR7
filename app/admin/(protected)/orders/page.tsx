import { updateOrderStatus } from "@/app/admin/actions";
import { AdminMutationForm } from "@/components/admin/admin-crud";
import { AdminEmpty, AdminPage } from "@/components/admin/admin-page";
import { requireAdmin } from "@/lib/auth/admin";
import type { OrderStatus } from "@/types/database";

const STATUSES: OrderStatus[] = ["pending", "payment_pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"];

export default async function AdminOrdersPage() {
  const { supabase } = await requireAdmin();
  const { data: orders, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(100);
  if (error) throw new Error(error.message);
  return <AdminPage title="Pedidos" description="Estados y totales verificados por el backend.">
    {!orders.length ? <AdminEmpty>No hay pedidos. Los pagos todavía no están integrados.</AdminEmpty> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>PEDIDO</th><th>CLIENTE</th><th>FECHA</th><th>TOTAL</th><th>ESTADO</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id}><td><strong>{order.order_number}</strong></td><td>{order.customer_name}<span>{order.customer_email}</span></td><td>{new Date(order.created_at).toLocaleDateString("es-CO")}</td><td>${order.total.toLocaleString("es-CO")}</td><td><AdminMutationForm action={updateOrderStatus.bind(null, order.id)} successMessage="Estado actualizado." className="admin-select-form"><select name="status" defaultValue={order.status}>{STATUSES.map((status) => <option key={status}>{status}</option>)}</select><button type="submit">ACTUALIZAR</button></AdminMutationForm></td></tr>)}</tbody></table></div>}
  </AdminPage>;
}
