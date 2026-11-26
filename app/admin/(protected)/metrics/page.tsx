import Link from "next/link";
import { AdminEmpty, AdminFilters, AdminPage } from "@/components/admin/admin-page";
import {
  classifyOrder,
  FUNNEL_PERIODS,
  periodStart,
  summarizeCheckoutFunnel,
  type FunnelOutcome,
  type FunnelPeriod,
} from "@/lib/admin/checkout-funnel";
import { firstParam, pickOption } from "@/lib/admin/search";
import { GA_MEASUREMENT_ID } from "@/lib/analytics";
import { requireAdmin } from "@/lib/auth/admin";

const ORDER_LIMIT = 5000;
const RECENT_LIMIT = 25;

const money = (amount: number) => `$${amount.toLocaleString("es-CO")}`;
const percent = (rate: number | null) => (rate === null ? "—" : `${Math.round(rate * 100)} %`);

const OUTCOME_LABELS: Record<Extract<FunnelOutcome, "rejected" | "abandoned">, string> = {
  rejected: "PAGO RECHAZADO",
  abandoned: "ABANDONADO",
};

// Lo que mide Google Analytics en la tienda (lib/analytics.ts), para que el equipo sepa qué buscar allí.
const GA_EVENTS = [
  ["Visitas y usuarios", "page_view (automático), con origen del tráfico, dispositivo y ciudad"],
  ["Listados vistos", "view_item_list en tienda, categorías y búsqueda"],
  ["Fichas vistas", "view_item"],
  ["Carrito", "add_to_cart, remove_from_cart y view_cart"],
  ["Inicio del pago", "begin_checkout (primer campo del formulario) y add_shipping_info (envío de los datos)"],
  ["WhatsApp", "whatsapp_click"],
] as const;

type MetricsPageProps = Readonly<{ searchParams: Promise<Record<string, string | string[] | undefined>> }>;

export default async function AdminMetricsPage({ searchParams }: MetricsPageProps) {
  const params = await searchParams;
  const period: FunnelPeriod = pickOption(firstParam(params.dias), FUNNEL_PERIODS, "30");
  const { supabase } = await requireAdmin();
  const now = new Date();
  const since = periodStart(period, now).toISOString();

  const [ordersResult, rejectedResult] = await Promise.all([
    supabase.from("orders")
      .select("id, order_number, status, total, created_at, reservation_expires_at, customer_name, customer_email, customer_phone")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(ORDER_LIMIT),
    supabase.from("payments").select("order_id").eq("status", "rejected").gte("created_at", since),
  ]);
  if (ordersResult.error || rejectedResult.error) throw new Error("No se pudieron cargar las métricas de pedidos.");

  const orders = ordersResult.data;
  const rejectedIds = new Set(rejectedResult.data.map((payment) => payment.order_id));
  const funnel = summarizeCheckoutFunnel(orders, rejectedIds, now);
  const notCompleted = orders
    .map((order) => ({ ...order, outcome: classifyOrder(order, rejectedIds, now) }))
    .filter((order) => order.outcome === "rejected" || order.outcome === "abandoned");

  const metrics = [
    { label: "PAGOS INICIADOS", value: String(funnel.started.count), hint: `Pedidos que llegaron a Wompi · ${money(funnel.started.value)}`, href: "/admin/orders" },
    { label: "PAGADOS", value: String(funnel.paid.count), hint: `Conversión del pago ${percent(funnel.conversionRate)} · ${money(funnel.paid.value)}`, href: "/admin/orders" },
    { label: "NO COMPLETADOS", value: String(funnel.rejected.count + funnel.abandoned.count), hint: `Abandono del pago ${percent(funnel.abandonmentRate)} · ${money(funnel.rejected.value + funnel.abandoned.value)} sin cobrar`, href: "/admin/orders?estado=closed" },
    { label: "EN CURSO", value: String(funnel.in_progress.count), hint: "Aún dentro del tiempo para pagar", href: "/admin/orders?estado=awaiting_payment" },
  ];

  return (
    <AdminPage title="Métricas" description="Embudo de pago con los pedidos de la tienda. Las visitas y el comportamiento antes del pago se miden en Google Analytics.">
      <AdminFilters resetHref="/admin/metrics" active={period !== "30"}>
        <label><span>PERIODO</span><select name="dias" defaultValue={period}>
          <option value="7">Últimos 7 días</option>
          <option value="30">Últimos 30 días</option>
          <option value="90">Últimos 90 días</option>
        </select></label>
      </AdminFilters>

      <section className="admin-metrics" aria-label={`Embudo de pago, últimos ${period} días`}>
        {metrics.map((metric) => (
          <Link href={metric.href} key={metric.label}><span>{metric.label}</span><strong>{metric.value}</strong><small>{metric.hint}</small></Link>
        ))}
      </section>
      {orders.length >= ORDER_LIMIT ? <p className="admin-result-count">Se analizaron los {ORDER_LIMIT} pedidos más recientes del periodo.</p> : null}

      <section className="admin-panel" aria-labelledby="metrics-not-completed">
        <div className="admin-section-header">
          <div>
            <h2 id="metrics-not-completed">PAGOS SIN COMPLETAR</h2>
            <p>Clientes que enviaron sus datos y no terminaron de pagar: {funnel.rejected.count} con pago rechazado y {funnel.abandoned.count} abandonados. Puedes contactarlos para recuperar la venta.</p>
          </div>
          <Link href="/admin/orders?estado=closed">Ver pedidos cerrados</Link>
        </div>
        {!notCompleted.length ? <AdminEmpty>{orders.length ? "No hay pagos rechazados ni abandonados en este periodo." : "Todavía no hay pedidos en este periodo. Aparecerán cuando los clientes lleguen al pago."}</AdminEmpty> : (
          <div className="admin-table-wrap"><table className="admin-table">
            <thead><tr><th scope="col">PEDIDO / FECHA</th><th scope="col">CLIENTE</th><th scope="col">IMPORTE</th><th scope="col">ESTADO</th></tr></thead>
            <tbody>{notCompleted.slice(0, RECENT_LIMIT).map((order) => (
              <tr key={order.id}>
                <td><Link href={`/admin/orders?q=${encodeURIComponent(order.order_number)}`}><strong>{order.order_number}</strong></Link><span>{new Date(order.created_at).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}</span></td>
                <td><strong>{order.customer_name}</strong><span><a href={`mailto:${order.customer_email}`}>{order.customer_email}</a> · {order.customer_phone ?? "Sin celular"}</span></td>
                <td><strong>{money(order.total)}</strong></td>
                <td><span className={`admin-status ${order.outcome === "rejected" ? "is-danger" : "is-warning"}`}>{OUTCOME_LABELS[order.outcome as keyof typeof OUTCOME_LABELS]}</span></td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
        {notCompleted.length > RECENT_LIMIT ? <p className="admin-result-count">Mostrando los {RECENT_LIMIT} más recientes de {notCompleted.length}.</p> : null}
      </section>

      <section className="admin-panel" aria-labelledby="metrics-ga">
        <div className="admin-section-header">
          <div>
            <h2 id="metrics-ga">VISITAS Y COMPORTAMIENTO</h2>
            <p>
              {GA_MEASUREMENT_ID
                ? `Google Analytics está activo (${GA_MEASUREMENT_ID}). Solo cuenta a los visitantes que aceptan las cookies de analítica.`
                : "Google Analytics no está configurado. Define NEXT_PUBLIC_GA_MEASUREMENT_ID en Vercel y vuelve a desplegar para empezar a medir."}
            </p>
          </div>
          {GA_MEASUREMENT_ID ? <a href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer">Abrir Google Analytics<span className="sr-only"> (se abre en una pestaña nueva)</span></a> : null}
        </div>
        <ul className="admin-compact-list">
          {GA_EVENTS.map(([label, events]) => <li key={label}><strong>{label}</strong><span>{events}</span></li>)}
        </ul>
        <p className="admin-result-count">En Google Analytics: Informes → Monetización → Recorrido de compra para ver el abandono en cada paso; Adquisición para el origen de las visitas.</p>
      </section>
    </AdminPage>
  );
}
