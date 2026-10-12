import { updateInventory } from "@/app/admin/actions";
import { AdminMutationForm } from "@/components/admin/admin-crud";
import { AdminEmpty, AdminPage } from "@/components/admin/admin-page";
import { requireAdmin } from "@/lib/auth/admin";

function getStockStatus(stock: number, threshold: number) {
  if (stock === 0) return "AGOTADO";
  if (stock <= threshold) return "STOCK BAJO";
  return "DISPONIBLE";
}

export default async function AdminInventoryPage() {
  const { supabase } = await requireAdmin();
  const [variantResult, productResult, inventoryResult] = await Promise.all([
    supabase.from("product_variants").select("id, product_id, sku, size, color, active").order("sku"),
    supabase.from("products").select("id, name"),
    supabase.from("inventory").select("variant_id, stock, low_stock_threshold, updated_at"),
  ]);
  const firstError = [variantResult.error, productResult.error, inventoryResult.error].find(Boolean);
  if (firstError) throw new Error(firstError.message);
  const variants = variantResult.data ?? [];
  const products = new Map((productResult.data ?? []).map((product) => [product.id, product.name]));
  const inventory = new Map((inventoryResult.data ?? []).map((item) => [item.variant_id, item]));

  return <AdminPage title="Inventario" description="Stock real por talla, color y SKU.">
    {!variants.length ? <AdminEmpty>Crea variantes desde un producto para administrar stock.</AdminEmpty> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>PRODUCTO</th><th>VARIANTE</th><th>SKU</th><th>ESTADO</th><th>STOCK</th><th>UMBRAL</th><th></th></tr></thead><tbody>{variants.map((variant) => {
      const item = inventory.get(variant.id); const stock = item?.stock ?? 0; const threshold = item?.low_stock_threshold ?? 3;
      const state = getStockStatus(stock, threshold);
      return <tr key={variant.id}><td><strong>{products.get(variant.product_id) ?? "Producto"}</strong></td><td>{variant.size}{variant.color ? ` / ${variant.color}` : ""}</td><td>{variant.sku}</td><td><span className={`admin-status ${stock > threshold ? "is-active" : "is-warning"}`}>{state}</span></td><td colSpan={3}><AdminMutationForm action={updateInventory.bind(null, variant.id)} successMessage="Inventario actualizado." className="admin-inventory-form"><input name="stock" type="number" min="0" defaultValue={stock} aria-label={`Stock de ${variant.sku}`} /><input name="low_stock_threshold" type="number" min="0" defaultValue={threshold} aria-label={`Umbral de ${variant.sku}`} /><button type="submit">GUARDAR</button></AdminMutationForm></td></tr>;
    })}</tbody></table></div>}
  </AdminPage>;
}
