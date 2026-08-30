import { createCategory, deleteCategory, updateCategory } from "@/app/admin/actions";
import { AdminEmpty, AdminPage } from "@/components/admin/admin-page";
import { requireAdmin } from "@/lib/auth/admin";
import { catalogCategoryNames } from "@/lib/validation/admin";
import type { CategoryRow } from "@/types/database";

export default async function AdminCategoriesPage() {
  const { supabase } = await requireAdmin();
  const { data: categories, error } = await supabase.from("categories").select("*").order("sort_order");
  if (error) throw new Error(error.message);

  return <AdminPage title="Categorías" description="Jerarquía, orden y publicación del catálogo.">
    <section className="admin-panel"><h2>NUEVA CATEGORÍA</h2><CategoryForm action={createCategory} categories={categories} /></section>
    <section className="admin-panel"><h2>CATEGORÍAS</h2>{!categories.length ? <AdminEmpty>No hay categorías en Supabase.</AdminEmpty> : <div className="admin-stack">{categories.map((category) => <CategoryForm key={category.id} action={updateCategory.bind(null, category.id)} categories={categories.filter((item) => item.id !== category.id)} category={category} deleteAction={deleteCategory.bind(null, category.id)} />)}</div>}</section>
  </AdminPage>;
}

function CategoryForm({ action, categories, category, deleteAction }: Readonly<{ action: (data: FormData) => void | Promise<void>; categories: Array<{ id: string; name: string }>; category?: CategoryRow; deleteAction?: () => void | Promise<void> }>) {
  return <form action={action} className="admin-form admin-category-form">
    <select name="name" defaultValue={category?.name ?? "FUTBOL"}>{catalogCategoryNames.map((name) => <option key={name} value={name}>{name}</option>)}</select><input name="slug" defaultValue={category?.slug} placeholder="SLUG" required />
    <input name="description" defaultValue={category?.description ?? ""} placeholder="DESCRIPCIÓN" />
    <select name="parent_id" defaultValue={category?.parent_id ?? ""}><option value="">Sin padre</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
    <input name="sort_order" type="number" min="0" defaultValue={category?.sort_order ?? 0} aria-label="Orden" />
    <label className="admin-check-label"><input name="active" type="checkbox" defaultChecked={category?.active ?? true} /> Activa</label>
    <button type="submit">{category ? "GUARDAR" : "CREAR"}</button>
    {deleteAction ? <button type="submit" formAction={deleteAction} className="admin-danger-text">ELIMINAR</button> : null}
  </form>;
}
