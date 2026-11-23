import Link from "next/link";
import { updateInventory } from "@/app/admin/actions";
import { AdminMutationForm } from "@/components/admin/admin-crud";
import { AdminEmpty, AdminFilters, AdminPage, AdminResultCount } from "@/components/admin/admin-page";
import { firstParam, pickOption, sanitizeAdminSearch } from "@/lib/admin/search";
import { requireAdmin } from "@/lib/auth/admin";

const STOCK_FILTERS = ["all", "bajo", "agotado"] as const;

function getStockStatus(stock: number, threshold: number) {
  if (stock === 0) return { label: "AGOTADO", className: "is-danger" };
  if (stock <= threshold) return { label: "STOCK BAJO", className: "is-warning" };
  return { label: "DISPONIBLE", className: "is-active" };
}

type InventoryPageProps = Readonly<{ searchParams: Promise<Record<string, string | string[] | undefined>> }>;

export default async function AdminInventoryPage({ searchParams }: InventoryPageProps) {
  const params = await searchParams;
  const q = sanitizeAdminSearch(firstParam(params.q)).toLowerCase();
  const filter = pickOption(firstParam(params.estado), STOCK_FILTERS, "all");
  const { supabase, preview } = await requireAdmin();
  if (preview) {
    return <AdminPage title="Inventario" description="Stock real por talla, color y SKU."><AdminEmpty>El inventario está protegido por RLS y no se puede consultar en modo preview. Inicia sesión ADMIN para ver el stock real.</AdminEmpty></AdminPage>;
  }
  const [variantResult, productResult, inventoryResult] = await Promise.all([
    supabase.from("product_variants").select("id, product_id, sku, size, color, active").order("sku"),
    supabase.from("products").select("id, name"),
    supabase.from("inventory").select("variant_id, stock, low_stock_threshold, updated_at"),
  ]);
  const firstError = [variantResult.error, productResult.error, inventoryResult.error].find(Boolean);
  if (firstError) throw new Error(firstError.message);
  const allVariants = variantResult.data ?? [];
  const products = new Map((productResult.data ?? []).map((product) => [product.id, product.name]));
  const inventory = new Map((inventoryResult.data ?? []).map((item) => [item.variant_id, item]));

  const rows = allVariants
    .map((variant) => {
      const item = inventory.get(variant.id);
      const stock = item?.stock ?? 0;
      const threshold = item?.low_stock_threshold ?? 3;
      return { variant, productName: products.get(variant.product_id) ?? "Producto", stock, threshold, missing: !item };
    })
    .filter((row) => {
      if (filter === "agotado" && row.stock !== 0) return false;
      if (filter === "bajo" && row.stock > row.threshold) return false;
      if (q && !`${row.productName} ${row.variant.sku} ${row.variant.size} ${row.variant.color ?? ""}`.toLowerCase().includes(q)) return false;
      return true;
    });
  const filtered = Boolean(q) || filter !== "all";

  return <AdminPage title="Inventario" description="Stock real por talla, color y SKU. El estado se calcula con el umbral de cada variante.">
    <AdminFilters resetHref="/admin/inventory" active={filtered}>
      <label><span>BUSCAR</span><input name="q" type="search" defaultValue={q} placeholder="Producto, SKU o talla" /></label>
      <label><span>ESTADO</span><select name="estado" defaultValue={filter}><option value="all">Todos</option><option value="bajo">Stock bajo o agotado</option><option value="agotado">Solo agotados</option></select></label>
    </AdminFilters>
    {!allVariants.length ? <AdminEmpty action={<Link href="/admin/products">Ir a productos</Link>}>Crea variantes desde un producto para administrar stock.</AdminEmpty>
      : !rows.length ? <AdminEmpty action={<Link href="/admin/inventory">Limpiar filtros</Link>}>Ninguna variante coincide con los filtros.</AdminEmpty>
      : <>
        <AdminResultCount shown={rows.length} noun={rows.length === 1 ? "variante" : "variantes"} />
        <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th scope="col">PRODUCTO</th><th scope="col">VARIANTE</th><th scope="col">SKU</th><th scope="col">ESTADO</th><th scope="col">STOCK · UMBRAL</th></tr></thead><tbody>{rows.map(({ variant, productName, stock, threshold, missing }) => {
          const state = getStockStatus(stock, threshold);
          return <tr key={variant.id}>
            <td><Link className="admin-cell-link" href={`/admin/products/${variant.product_id}`}><strong>{productName}</strong></Link>{variant.active ? null : <span>Variante inactiva</span>}</td>
            <td>{variant.size}{variant.color ? ` / ${variant.color}` : ""}</td>
            <td>{variant.sku}</td>
            <td><span className={`admin-status ${state.className}`}>{state.label}</span>{missing ? <span>Sin registro de inventario</span> : null}</td>
            <td><AdminMutationForm action={updateInventory.bind(null, variant.id)} successMessage={`Stock de ${variant.sku} actualizado.`} className="admin-inventory-form">
              <label><span className="admin-visually-hidden">Stock de {variant.sku}</span><input name="stock" type="number" min="0" step="1" inputMode="numeric" defaultValue={stock} required /></label>
              <label><span className="admin-visually-hidden">Umbral de stock bajo de {variant.sku}</span><input name="low_stock_threshold" type="number" min="0" step="1" inputMode="numeric" defaultValue={threshold} required /></label>
              <button type="submit">GUARDAR</button>
            </AdminMutationForm></td>
          </tr>;
        })}</tbody></table></div>
      </>}
  </AdminPage>;
}
