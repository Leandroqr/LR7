import { createCategory, deleteCategory, updateCategory } from "@/app/admin/actions";
import { AdminConfirmAction, AdminDialog, AdminMutationForm } from "@/components/admin/admin-crud";
import { AdminEmpty, AdminPage } from "@/components/admin/admin-page";
import { requireAdmin } from "@/lib/auth/admin";
import { catalogCategoryNames } from "@/lib/validation/admin";
import type { CategoryRow } from "@/types/database";

export default async function AdminCategoriesPage() {
  const { supabase } = await requireAdmin();
  const { data: categories, error } = await supabase.from("categories").select("*").order("sort_order");
  if (error) throw new Error(error.message);
  return <AdminPage title="Categorías" description="Organiza la jerarquía y visibilidad del catálogo." action={<AdminDialog label="Agregar categoría" title="Nueva categoría"><CategoryForm action={createCategory} categories={categories} submitLabel="Crear categoría" /></AdminDialog>}>
    {!categories.length ? <AdminEmpty>Aún no hay categorías. Agrega la primera para clasificar el catálogo.</AdminEmpty> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>CATEGORÍA</th><th>PADRE</th><th>ORDEN</th><th>ESTADO</th><th>ACCIONES</th></tr></thead><tbody>{categories.map((category) => <tr key={category.id}><td><strong>{category.name}</strong><span>/{category.slug}</span></td><td>{categories.find((item) => item.id === category.parent_id)?.name ?? "Principal"}</td><td>{category.sort_order}</td><td><span className={`admin-status ${category.active ? "is-active" : ""}`}>{category.active ? "ACTIVA" : "INACTIVA"}</span></td><td><div className="admin-row-actions"><AdminDialog label="Editar" title={`Editar ${category.name}`}><CategoryForm action={updateCategory.bind(null, category.id)} categories={categories.filter((item) => item.id !== category.id)} category={category} submitLabel="Guardar cambios" /></AdminDialog><AdminConfirmAction action={deleteCategory.bind(null, category.id)} itemName={`la categoría ${category.name}`} /></div></td></tr>)}</tbody></table></div>}
  </AdminPage>;
}

function CategoryForm({ action, categories, category, submitLabel }: Readonly<{ action: (data: FormData) => void | Promise<void>; categories: Array<{ id: string; name: string }>; category?: CategoryRow; submitLabel: string }>) {
  return <AdminMutationForm action={action} successMessage="Categoría guardada." className="admin-form admin-form-grid"><label><span>NOMBRE</span><select name="name" defaultValue={category?.name ?? "FUTBOL"}>{catalogCategoryNames.map((name) => <option key={name} value={name}>{name}</option>)}</select></label><label><span>SLUG</span><input name="slug" defaultValue={category?.slug} required /></label><label className="admin-form-full"><span>DESCRIPCIÓN</span><textarea name="description" rows={3} defaultValue={category?.description ?? ""} /></label><label><span>CATEGORÍA PADRE</span><select name="parent_id" defaultValue={category?.parent_id ?? ""}><option value="">Sin padre</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label><span>ORDEN</span><input name="sort_order" type="number" min="0" defaultValue={category?.sort_order ?? 0} required /></label><label className="admin-check-label admin-form-full"><input name="active" type="checkbox" defaultChecked={category?.active ?? true} /> Publicada y visible</label><button type="submit" className="admin-primary admin-form-full">{submitLabel}</button></AdminMutationForm>;
}