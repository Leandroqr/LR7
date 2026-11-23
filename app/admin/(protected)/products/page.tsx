import Link from "next/link";
import { toggleProduct } from "@/app/admin/actions";
import { AdminMutationForm } from "@/components/admin/admin-crud";
import { AdminEmpty, AdminFilters, AdminPage, AdminResultCount } from "@/components/admin/admin-page";
import { firstParam, pickOption, sanitizeAdminSearch } from "@/lib/admin/search";
import { requireAdmin } from "@/lib/auth/admin";

const STATUS_FILTERS = ["all", "active", "inactive"] as const;
const BRAND_FILTERS = ["all", "FUTBOL", "TRAINING"] as const;

type ProductsPageProps = Readonly<{ searchParams: Promise<Record<string, string | string[] | undefined>> }>;

export default async function AdminProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const q = sanitizeAdminSearch(firstParam(params.q));
  const status = pickOption(firstParam(params.estado), STATUS_FILTERS, "all");
  const brand = pickOption(firstParam(params.marca), BRAND_FILTERS, "all");
  const { supabase } = await requireAdmin();

  let query = supabase
    .from("products")
    .select("id, name, slug, price, brand, featured, active, updated_at")
    .order("updated_at", { ascending: false });
  if (q) query = query.or(`name.ilike.*${q}*,slug.ilike.*${q}*,team.ilike.*${q}*`);
  if (status !== "all") query = query.eq("active", status === "active");
  if (brand !== "all") query = query.eq("brand", brand);
  const { data: products, error } = await query;
  if (error) throw new Error(error.message);
  const filtered = Boolean(q) || status !== "all" || brand !== "all";

  return (
    <AdminPage title="Productos" description="Catálogo y estado de publicación." action={<Link className="admin-primary-link" href="/admin/products/new">NUEVO PRODUCTO</Link>}>
      <AdminFilters resetHref="/admin/products" active={filtered}>
        <label><span>BUSCAR</span><input name="q" type="search" defaultValue={q} placeholder="Nombre, slug o equipo" /></label>
        <label><span>ESTADO</span><select name="estado" defaultValue={status}><option value="all">Todos</option><option value="active">Activos</option><option value="inactive">Inactivos</option></select></label>
        <label><span>LÍNEA</span><select name="marca" defaultValue={brand}><option value="all">Todas</option><option value="FUTBOL">Fútbol</option><option value="TRAINING">Training</option></select></label>
      </AdminFilters>
      {!products.length ? (
        filtered
          ? <AdminEmpty action={<Link href="/admin/products">Limpiar filtros</Link>}>Ningún producto coincide con los filtros.</AdminEmpty>
          : <AdminEmpty action={<Link className="admin-primary-link" href="/admin/products/new">CREAR EL PRIMER PRODUCTO</Link>}>No hay productos en Supabase. Los mocks públicos siguen activos.</AdminEmpty>
      ) : (
        <>
          <AdminResultCount shown={products.length} noun={products.length === 1 ? "producto" : "productos"} />
          <div className="admin-table-wrap"><table className="admin-table">
            <thead><tr><th scope="col">PRODUCTO</th><th scope="col">LÍNEA</th><th scope="col">PRECIO</th><th scope="col">DESTACADO</th><th scope="col">ESTADO</th><th scope="col">ACCIONES</th></tr></thead>
            <tbody>{products.map((product) => (
              <tr key={product.id}>
                <td><Link className="admin-cell-link" href={`/admin/products/${product.id}`}><strong>{product.name}</strong></Link><span>/{product.slug}</span></td>
                <td>{product.brand === "FUTBOL" ? "Fútbol" : "Training"}</td><td>${product.price.toLocaleString("es-CO")}</td>
                <td>{product.featured ? "Sí" : "No"}</td>
                <td><span className={`admin-status ${product.active ? "is-active" : ""}`}>{product.active ? "ACTIVO" : "INACTIVO"}</span></td>
                <td><div className="admin-row-actions">
                  <Link href={`/admin/products/${product.id}`}>EDITAR</Link>
                  {product.active ? <Link href={`/productos/${product.slug}`} target="_blank" rel="noopener" aria-label={`Ver ${product.name} en la tienda (nueva pestaña)`}>VER EN TIENDA ↗</Link> : null}
                  <AdminMutationForm action={toggleProduct.bind(null, product.id, product.active)} successMessage={product.active ? `${product.name} desactivado.` : `${product.name} activado.`}><button type="submit">{product.active ? "DESACTIVAR" : "ACTIVAR"}</button></AdminMutationForm>
                </div></td>
              </tr>
            ))}</tbody>
          </table></div>
        </>
      )}
    </AdminPage>
  );
}
