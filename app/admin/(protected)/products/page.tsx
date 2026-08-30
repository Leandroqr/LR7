import Link from "next/link";
import { toggleProduct } from "@/app/admin/actions";
import { AdminEmpty, AdminPage } from "@/components/admin/admin-page";
import { requireAdmin } from "@/lib/auth/admin";

export default async function AdminProductsPage() {
  const { supabase } = await requireAdmin();
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, slug, price, brand, featured, active, updated_at")
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);

  return (
    <AdminPage title="Productos" description="Catálogo y estado de publicación." action={<Link className="admin-primary-link" href="/admin/products/new">NUEVO PRODUCTO</Link>}>
      {!products.length ? <AdminEmpty>No hay productos en Supabase. Los mocks públicos siguen activos.</AdminEmpty> : (
        <div className="admin-table-wrap"><table className="admin-table">
          <thead><tr><th>PRODUCTO</th><th>MARCA</th><th>PRECIO</th><th>DESTACADO</th><th>ESTADO</th><th>ACCIONES</th></tr></thead>
          <tbody>{products.map((product) => (
            <tr key={product.id}>
              <td><strong>{product.name}</strong><span>/{product.slug}</span></td>
              <td>{product.brand}</td><td>${product.price.toLocaleString("es-CO")}</td>
              <td>{product.featured ? "Sí" : "No"}</td>
              <td><span className={`admin-status ${product.active ? "is-active" : ""}`}>{product.active ? "ACTIVO" : "INACTIVO"}</span></td>
              <td><div className="admin-row-actions"><Link href={`/admin/products/${product.id}`}>EDITAR</Link><form action={toggleProduct.bind(null, product.id, product.active)}><button type="submit">{product.active ? "DESACTIVAR" : "ACTIVAR"}</button></form></div></td>
            </tr>
          ))}</tbody>
        </table></div>
      )}
    </AdminPage>
  );
}
