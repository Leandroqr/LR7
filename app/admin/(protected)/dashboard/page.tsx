import Link from "next/link";
import { AdminPage } from "@/components/admin/admin-page";
import { requireAdmin } from "@/lib/auth/admin";

export default async function AdminDashboardPage() {
  const { supabase } = await requireAdmin();
  const [products, orders, users, lowStock] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("inventory").select("variant_id", { count: "exact", head: true }).lte("stock", 3),
  ]);

  const metrics = [
    ["PRODUCTOS", products.count ?? 0, "/admin/products"],
    ["PEDIDOS", orders.count ?? 0, "/admin/orders"],
    ["USUARIOS", users.count ?? 0, "/admin/users"],
    ["STOCK BAJO", lowStock.count ?? 0, "/admin/inventory"],
  ] as const;

  return (
    <AdminPage title="Dashboard" description="Estado operativo de LR7.">
      <section className="admin-metrics" aria-label="Resumen">
        {metrics.map(([label, metric, href]) => (
          <Link href={href} key={label}><span>{label}</span><strong>{metric}</strong></Link>
        ))}
      </section>
      <section className="admin-panel">
        <h2>BASE ECOMMERCE</h2>
        <p>Productos, inventario, contenido, usuarios y pedidos están preparados sobre PostgreSQL con RLS. Los pagos permanecen desactivados.</p>
      </section>
    </AdminPage>
  );
}
