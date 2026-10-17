import Image from "next/image";
import { notFound } from "next/navigation";
import {
  createVariant,
  deleteProduct,
  deleteProductImage,
  deleteVariant,
  updateProduct,
  updateVariant,
  uploadProductImage,
} from "@/app/admin/actions";
import { AdminConfirmAction, AdminMutationForm } from "@/components/admin/admin-crud";
import { AdminPage } from "@/components/admin/admin-page";
import { ProductForm } from "@/components/admin/product-form";
import { resolveProductImageUrl } from "@/lib/admin/product-images";
import { requireAdmin } from "@/lib/auth/admin";

type ProductAdminPageProps = Readonly<{ params: Promise<{ id: string }> }>;

export default async function ProductAdminPage({ params }: ProductAdminPageProps) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const [productResult, categoryResult, primaryResult, variantResult, imageResult] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).maybeSingle(),
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("product_categories").select("category_id").eq("product_id", id).eq("is_primary", true).maybeSingle(),
    supabase.from("product_variants").select("*").eq("product_id", id).order("size"),
    supabase.from("product_images").select("*").eq("product_id", id).order("sort_order"),
  ]);
  if (productResult.error) throw new Error("No se pudo consultar el producto para edición.");
  if (!productResult.data) notFound();
  if ([categoryResult.error, primaryResult.error, variantResult.error, imageResult.error].some(Boolean)) {
    throw new Error("No se pudieron cargar todos los datos de edición.");
  }

  const variants = variantResult.data ?? [];
  const categories = categoryResult.data ?? [];
  const images = imageResult.data ?? [];
  const variantIds = variants.map((variant) => variant.id);
  const inventoryResult = variantIds.length
    ? await supabase.from("inventory").select("*").in("variant_id", variantIds)
    : { data: [], error: null };
  if (inventoryResult.error) throw new Error(inventoryResult.error.message);
  const inventory = new Map(inventoryResult.data.map((item) => [item.variant_id, item]));

  return (
    <AdminPage title={productResult.data.name} description="Producto, imágenes, variantes e inventario.">
      <section className="admin-panel">
        <h2>INFORMACIÓN</h2>
        <ProductForm action={updateProduct.bind(null, id)} product={productResult.data} categories={categories} primaryCategoryId={primaryResult.data?.category_id} submitLabel="GUARDAR CAMBIOS" />
      </section>

      <section className="admin-panel">
        <h2>IMÁGENES</h2>
        <AdminMutationForm action={uploadProductImage.bind(null, id)} successMessage="Imagen subida." className="admin-form admin-inline-form">
          <label><span>ARCHIVO</span><input name="image" type="file" accept="image/jpeg,image/png,image/webp,image/avif" required /></label>
          <label><span>ALT</span><input name="alt_text" required maxLength={240} /></label>
          <label><span>ORDEN</span><input name="sort_order" type="number" min="0" defaultValue="0" /></label>
          <label className="admin-check-label"><input name="is_hover" type="checkbox" /> Hover</label>
          <button type="submit">SUBIR</button>
        </AdminMutationForm>
        <div className="admin-media-list">
          {images.map((image) => {
            const publicUrl = resolveProductImageUrl(image.storage_path, (path) => supabase.storage.from("products").getPublicUrl(path).data.publicUrl);
            return <article key={image.id}><Image src={publicUrl} alt={image.alt_text} width={64} height={76} /><div><strong>{image.alt_text}</strong><span>{image.storage_path}</span></div><AdminConfirmAction action={deleteProductImage.bind(null, image.id, id)} itemName="esta imagen" /></article>;
          })}
        </div>
      </section>

      <section className="admin-panel">
        <h2>VARIANTES E INVENTARIO</h2>
        <AdminMutationForm action={createVariant.bind(null, id)} successMessage="Variante creada." className="admin-form admin-variant-form">
          <input name="sku" placeholder="SKU" required /><input name="size" placeholder="TALLA" required /><input name="color" placeholder="COLOR" />
          <input name="price_override" type="number" min="0" placeholder="PRECIO OPCIONAL" /><input name="stock" type="number" min="0" defaultValue="0" aria-label="Stock" /><input name="low_stock_threshold" type="number" min="0" defaultValue="3" aria-label="Umbral de stock bajo" />
          <label className="admin-check-label"><input name="active" type="checkbox" defaultChecked /> Activa</label><button type="submit">AGREGAR</button>
        </AdminMutationForm>
        <div className="admin-stack">{variants.map((variant) => {
          const itemInventory = inventory.get(variant.id);
          return <AdminMutationForm key={variant.id} action={updateVariant.bind(null, variant.id, id)} successMessage="Variante actualizada." className="admin-form admin-variant-form">
            <input name="sku" defaultValue={variant.sku} required aria-label="SKU" /><input name="size" defaultValue={variant.size} required aria-label="Talla" /><input name="color" defaultValue={variant.color ?? ""} aria-label="Color" />
            <input name="price_override" type="number" min="0" defaultValue={variant.price_override ?? ""} aria-label="Precio opcional" /><input name="stock" type="number" min="0" defaultValue={itemInventory?.stock ?? 0} aria-label="Stock" /><input name="low_stock_threshold" type="number" min="0" defaultValue={itemInventory?.low_stock_threshold ?? 3} aria-label="Umbral de stock bajo" />
            <label className="admin-check-label"><input name="active" type="checkbox" defaultChecked={variant.active} /> Activa</label><button type="submit">GUARDAR</button><AdminConfirmAction action={deleteVariant.bind(null, variant.id, id)} itemName={`la variante ${variant.sku}`} />
          </AdminMutationForm>;
        })}</div>
      </section>

      <section className="admin-danger-zone"><h2>ELIMINAR PRODUCTO</h2><p>Los pedidos históricos conservan su snapshot. Esta acción no se puede deshacer.</p><AdminConfirmAction action={deleteProduct.bind(null, id)} label="Eliminar definitivamente" itemName={`el producto ${productResult.data.name}`} /></section>
    </AdminPage>
  );
}
