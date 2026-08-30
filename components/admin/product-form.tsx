import type { CategoryRow, ProductRow } from "@/types/database";

type ProductFormProps = Readonly<{
  action: (formData: FormData) => void | Promise<void>;
  product?: ProductRow;
  categories: CategoryRow[];
  primaryCategoryId?: string | null;
  submitLabel: string;
}>;

export function ProductForm({ action, product, categories, primaryCategoryId, submitLabel }: ProductFormProps) {
  return (
    <form action={action} className="admin-form admin-form-grid">
      <label><span>NOMBRE</span><input name="name" defaultValue={product?.name} required minLength={2} /></label>
      <label><span>SLUG</span><input name="slug" defaultValue={product?.slug} required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" /></label>
      <label><span>PRECIO COP</span><input name="price" type="number" min="0" step="1" defaultValue={product?.price} required /></label>
      <label><span>PRECIO ANTERIOR</span><input name="compare_at_price" type="number" min="0" step="1" defaultValue={product?.compare_at_price ?? ""} /></label>
      <label><span>MARCA / LÍNEA</span><select name="brand" defaultValue={product?.brand ?? "FUTBOL"}><option value="FUTBOL">Fútbol</option><option value="TRAINING">Training</option></select></label>
      <label><span>EQUIPO</span><input name="team" defaultValue={product?.team ?? ""} /></label>
      <label><span>BADGE</span><select name="badge" defaultValue={product?.badge ?? ""}><option value="">Sin badge</option><option value="NUEVO">Nuevo</option><option value="MAS VENDIDA">Más vendida</option><option value="LIMITADA">Limitada</option></select></label>
      <label>
        <span>CATEGORÍA PRINCIPAL</span>
        <select name="category_id" defaultValue={primaryCategoryId ?? ""}>
          <option value="">Sin categoría</option>
          {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
      </label>
      <label className="admin-form-full"><span>DESCRIPCIÓN</span><textarea name="description" rows={6} defaultValue={product?.description} /></label>
      <div className="admin-checks admin-form-full">
        <label><input name="personalizable" type="checkbox" defaultChecked={product?.personalizable} /> Personalizable</label>
        <label><input name="featured" type="checkbox" defaultChecked={product?.featured} /> Destacado</label>
        <label><input name="active" type="checkbox" defaultChecked={product?.active ?? true} /> Activo</label>
      </div>
      <button type="submit" className="admin-primary admin-form-full">{submitLabel}</button>
    </form>
  );
}
