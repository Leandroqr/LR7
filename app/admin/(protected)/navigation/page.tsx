import { createNavigationItem, deleteNavigationItem, updateNavigationItem } from "@/app/admin/actions";
import { AdminConfirmAction, AdminDialog, AdminMutationForm } from "@/components/admin/admin-crud";
import { AdminEmpty, AdminPage } from "@/components/admin/admin-page";
import { requireAdmin } from "@/lib/auth/admin";

type NavigationItem = { id: string; location: "header" | "footer"; label: string; href: string; sort_order: number; active: boolean };

export default async function AdminNavigationPage() {
  const { supabase } = await requireAdmin();
  const { data: items, error } = await supabase.from("navigation_items").select("*").order("location").order("sort_order");
  if (error) throw new Error(error.message);
  return <AdminPage title="Navegación" description="Gestiona los enlaces visibles en header y footer." action={<AdminDialog label="Agregar enlace" title="Nuevo enlace"><NavigationForm action={createNavigationItem} submitLabel="Crear enlace" /></AdminDialog>}>
    {!items.length ? <AdminEmpty>Aún no hay enlaces administrables. Crea uno para reemplazar el fallback público.</AdminEmpty> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>ETIQUETA</th><th>UBICACIÓN</th><th>DESTINO</th><th>ORDEN</th><th>ESTADO</th><th>ACCIONES</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td><strong>{item.label}</strong></td><td>{item.location === "header" ? "Header" : "Footer"}</td><td>{item.href}</td><td>{item.sort_order}</td><td><span className={`admin-status ${item.active ? "is-active" : ""}`}>{item.active ? "ACTIVO" : "INACTIVO"}</span></td><td><div className="admin-row-actions"><AdminDialog label="Editar" title={`Editar ${item.label}`}><NavigationForm action={updateNavigationItem.bind(null, item.id)} item={item} submitLabel="Guardar cambios" /></AdminDialog><AdminConfirmAction action={deleteNavigationItem.bind(null, item.id)} itemName={`el enlace ${item.label}`} /></div></td></tr>)}</tbody></table></div>}
  </AdminPage>;
}

function NavigationForm({ action, item, submitLabel }: Readonly<{ action: (data: FormData) => void | Promise<void>; item?: NavigationItem; submitLabel: string }>) {
  return <AdminMutationForm action={action} successMessage="Enlace guardado." className="admin-form admin-form-grid"><label><span>UBICACIÓN</span><select name="location" defaultValue={item?.location ?? "header"}><option value="header">Header</option><option value="footer">Footer</option></select></label><label><span>ETIQUETA</span><input name="label" defaultValue={item?.label} required /></label><label className="admin-form-full"><span>DESTINO</span><input name="href" defaultValue={item?.href ?? "/"} required /></label><label><span>ORDEN</span><input name="sort_order" type="number" min="0" defaultValue={item?.sort_order ?? 0} required /></label><label className="admin-check-label"><input name="active" type="checkbox" defaultChecked={item?.active ?? true} /> Visible</label><button type="submit" className="admin-primary admin-form-full">{submitLabel}</button></AdminMutationForm>;
}