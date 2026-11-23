"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { AdminMutationForm } from "@/components/admin/admin-crud";
import { slugify } from "@/lib/admin/slug";
import type { CategoryRow, ProductRow } from "@/types/database";

type ProductFormProps = Readonly<{
  action: (formData: FormData) => unknown;
  product?: ProductRow;
  categories: CategoryRow[];
  primaryCategoryId?: string | null;
  submitLabel: string;
}>;

export function ProductForm({ action, product, categories, primaryCategoryId, submitLabel }: ProductFormProps) {
  const router = useRouter();
  const slugRef = useRef<HTMLInputElement>(null);
  // New products derive the slug from the name until the admin edits it by hand.
  const slugTouched = useRef(Boolean(product));

  return (
    <AdminMutationForm
      action={action}
      successMessage={product ? "Producto actualizado." : "Producto creado. Ahora agrega imágenes y variantes."}
      onSuccess={(data) => {
        if (!product && typeof data === "string") router.push(`/admin/products/${encodeURIComponent(data)}`);
        else router.refresh();
      }}
      className="admin-form admin-form-grid"
    >
      <label><span>NOMBRE</span><input name="name" defaultValue={product?.name} required minLength={2} maxLength={160} onChange={(event) => {
        if (!slugTouched.current && slugRef.current) slugRef.current.value = slugify(event.currentTarget.value);
      }} /></label>
      <label><span>SLUG (URL)</span><input ref={slugRef} name="slug" defaultValue={product?.slug} required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" title="Solo minúsculas, números y guiones" aria-describedby="product-slug-help" onChange={() => { slugTouched.current = true; }} /><small id="product-slug-help">/productos/<b>slug</b> · cambiarlo rompe enlaces compartidos.</small></label>
      <label><span>PRECIO COP</span><input name="price" type="number" min="0" step="1" inputMode="numeric" defaultValue={product?.price} required /></label>
      <label><span>PRECIO ANTERIOR</span><input name="compare_at_price" type="number" min="0" step="1" inputMode="numeric" defaultValue={product?.compare_at_price ?? ""} aria-describedby="product-compare-help" /><small id="product-compare-help">Opcional. Debe ser mayor que el precio para mostrarse tachado.</small></label>
      <label><span>MARCA / LÍNEA</span><select name="brand" defaultValue={product?.brand ?? "FUTBOL"}><option value="FUTBOL">Fútbol</option><option value="TRAINING">Training</option></select></label>
      <label><span>EQUIPO</span><input name="team" defaultValue={product?.team ?? ""} maxLength={120} /></label>
      <label><span>BADGE</span><select name="badge" defaultValue={product?.badge ?? ""}><option value="">Sin badge</option><option value="NUEVO">Nuevo</option><option value="MAS VENDIDA">Más vendida</option><option value="LIMITADA">Limitada</option></select></label>
      <label>
        <span>CATEGORÍA PRINCIPAL</span>
        <select name="category_id" defaultValue={primaryCategoryId ?? ""}>
          <option value="">Sin categoría</option>
          {categories.map((category) => <option key={category.id} value={category.id}>{category.name}{category.active ? "" : " (inactiva)"}</option>)}
        </select>
      </label>
      <label className="admin-form-full"><span>DESCRIPCIÓN</span><textarea name="description" rows={6} defaultValue={product?.description} maxLength={5000} /></label>
      <fieldset className="admin-checks admin-form-full">
        <legend className="admin-visually-hidden">Opciones de publicación</legend>
        <label><input name="personalizable" type="checkbox" defaultChecked={product?.personalizable} /> Personalizable (nombre y número)</label>
        <label><input name="featured" type="checkbox" defaultChecked={product?.featured} /> Destacado en home</label>
        <label><input name="active" type="checkbox" defaultChecked={product?.active ?? true} /> Activo (visible en tienda)</label>
      </fieldset>
      <button type="submit" className="admin-primary admin-form-full">{submitLabel}</button>
    </AdminMutationForm>
  );
}
