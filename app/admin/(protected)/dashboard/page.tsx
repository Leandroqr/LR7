import Link from "next/link";
import { AdminEmpty, AdminPage } from "@/components/admin/admin-page";
import { requireAdmin } from "@/lib/auth/admin";

const money = (amount: number) => `$${amount.toLocaleString("es-CO")}`;

export default async function AdminDashboardPage() {
  const { supabase, preview } = await requireAdmin();
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [products, activeProducts, toFulfill, paidThisMonth, variants, inventory] = await Promise.all([
    supabase.from("products").select("id, name"),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("active", true),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "paid").in("fulfillment_status", ["unfulfilled", "processing"]),
    supabase.from("orders").select("total").eq("status", "paid").gte("created_at", monthStart.toISOString()),
    supabase.from("product_variants").select("id, sku, size, color, product_id").eq("active", true),
    // Inventory is admin-only under RLS; the preview session cannot read it.
    preview ? Promise.resolve({ data: [], error: null }) : supabase.from("inventory").select("variant_id, stock, low_stock_threshold"),
  ]);

  const failed = [products, activeProducts, toFulfill, paidThisMonth, variants, inventory].find((result) => result.error);
  if (failed?.error) throw new Error(failed.error.message);
  const productNames = new Map((products.data ?? []).map((product) => [product.id, product.name]));
  const stockByVariant = new Map((inventory.data ?? []).map((item) => [item.variant_id, item]));
  const lowStock = (variants.data ?? [])
    .map((variant) => {
      const item = stockByVariant.get(variant.id);
      return { ...variant, stock: item?.stock ?? 0, threshold: item?.low_stock_threshold ?? 3 };
    })
    .filter((variant) => variant.stock <= variant.threshold)
    .sort((a, b) => a.stock - b.stock);
  const outOfStock = lowStock.filter((variant) => variant.stock === 0).length;
  const monthRevenue = (paidThisMonth.data ?? []).reduce((sum, order) => sum + order.total, 0);
  const monthName = monthStart.toLocaleDateString("es-CO", { month: "long" });

  const metrics = [
    { label: "POR PREPARAR", value: String(toFulfill.count ?? 0), hint: "Pedidos pagados sin enviar", href: "/admin/orders?estado=to_fulfill" },
    { label: `VENTAS ${monthName.toUpperCase()}`, value: money(monthRevenue), hint: `${paidThisMonth.data?.length ?? 0} pedidos pagados`, href: "/admin/orders" },
    { label: "PRODUCTOS ACTIVOS", value: `${activeProducts.count ?? 0}/${products.data?.length ?? 0}`, hint: "Visibles en la tienda", href: "/admin/products?estado=active" },
    { label: "STOCK BAJO", value: String(lowStock.length), hint: outOfStock ? `${outOfStock} agotadas` : "Según el umbral de cada variante", href: "/admin/inventory?estado=bajo" },
  ];

  return (
    <AdminPage title="Dashboard" description="Estado operativo de LR7. Los pagos se confirman desde Wompi.">
      <section className="admin-metrics" aria-label="Resumen">
        {metrics.map((metric) => (
          <Link href={metric.href} key={metric.label}><span>{metric.label}</span><strong>{metric.value}</strong><small>{metric.hint}</small></Link>
        ))}
      </section>
      <section className="admin-panel" aria-labelledby="dashboard-low-stock">
        <div className="admin-section-header">
          <div><h2 id="dashboard-low-stock">VARIANTES PARA REPONER</h2><p>Variantes activas con stock en o por debajo de su umbral.</p></div>
          <Link href="/admin/inventory?estado=bajo">Ver inventario</Link>
        </div>
        {preview ? <AdminEmpty>El inventario no es visible en modo preview.</AdminEmpty> : !lowStock.length ? <AdminEmpty>Todo el inventario activo está por encima de su umbral.</AdminEmpty> : (
          <ul className="admin-compact-list">
            {lowStock.slice(0, 6).map((variant) => {
              return <li key={variant.id}>
                <Link href={`/admin/products/${variant.product_id}`}><strong>{productNames.get(variant.product_id) ?? "Producto"}</strong> · {variant.size}{variant.color ? ` / ${variant.color}` : ""} <span>{variant.sku}</span></Link>
                <span className={`admin-status ${variant.stock === 0 ? "is-danger" : "is-warning"}`}>{variant.stock === 0 ? "AGOTADO" : `${variant.stock} UDS`}</span>
              </li>;
            })}
          </ul>
        )}
      </section>
    </AdminPage>
  );
}
