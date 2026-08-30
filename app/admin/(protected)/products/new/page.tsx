import { createProduct } from "@/app/admin/actions";
import { AdminPage } from "@/components/admin/admin-page";
import { ProductForm } from "@/components/admin/product-form";
import { requireAdmin } from "@/lib/auth/admin";

export default async function NewProductPage() {
  const { supabase } = await requireAdmin();
  const { data: categories, error } = await supabase.from("categories").select("*").order("sort_order");
  if (error) throw new Error(error.message);

  return <AdminPage title="Nuevo producto" description="Crea el producto y luego agrega imágenes y variantes."><section className="admin-panel"><ProductForm action={createProduct} categories={categories} submitLabel="CREAR PRODUCTO" /></section></AdminPage>;
}
