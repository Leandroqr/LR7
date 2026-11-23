import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  createVariant,
  deleteProduct,
  deleteProductImage,
  deleteVariant,
  updateProduct,
  updateProductImage,
  updateVariant,
  uploadProductImage,
} from "@/app/admin/actions";
import { AdminConfirmAction, AdminMutationForm } from "@/components/admin/admin-crud";
import { AdminEmpty, AdminPage } from "@/components/admin/admin-page";
import { ProductForm } from "@/components/admin/product-form";
import { resolveProductImageUrl } from "@/lib/admin/product-images";
import { requireAdmin } from "@/lib/auth/admin";
import { recordIdSchema } from "@/lib/validation/admin";

type ProductAdminPageProps = Readonly<{ params: Promise<{ id: string }> }>;

type VariantFieldsProps = Readonly<{
  sku?: string;
  size?: string;
  color?: string | null;
  priceOverride?: number | null;
  stock?: number;
  threshold?: number;
  active?: boolean;
}>;

function VariantFields({ sku, size, color, priceOverride, stock = 0, threshold = 3, active = true }: VariantFieldsProps) {
  return <>
    <label><span>SKU</span><input name="sku" defaultValue={sku} required minLength={2} maxLength={100} /></label>
    <label><span>TALLA</span><input name="size" defaultValue={size} required maxLength={30} /></label>
    <label><span>COLOR</span><input name="color" defaultValue={color ?? ""} maxLength={80} /></label>
    <label><span>PRECIO PROPIO</span><input name="price_override" type="number" min="0" step="1" defaultValue={priceOverride ?? ""} placeholder="Usa el del producto" /></label>
    <label><span>STOCK</span><input name="stock" type="number" min="0" step="1" defaultValue={stock} required /></label>
    <label><span>UMBRAL BAJO</span><input name="low_stock_threshold" type="number" min="0" step="1" defaultValue={threshold} required /></label>
    <label className="admin-check-label"><input name="active" type="checkbox" defaultChecked={active} /> Activa</label>
  </>;
}

export default async function ProductAdminPage({ params }: ProductAdminPageProps) {
  const { id } = await params;
  if (!recordIdSchema.safeParse(id).success) notFound();
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

  const product = productResult.data;
  const variants = variantResult.data ?? [];
  const categories = categoryResult.data ?? [];
  const images = imageResult.data ?? [];
  const variantIds = variants.map((variant) => variant.id);
  const inventoryResult = variantIds.length
    ? await supabase.from("inventory").select("*").in("variant_id", variantIds)
    : { data: [], error: null };
  if (inventoryResult.error) throw new Error(inventoryResult.error.message);
  const inventory = new Map(inventoryResult.data.map((item) => [item.variant_id, item]));
  const nextImageOrder = images.length ? Math.max(...images.map((image) => image.sort_order)) + 1 : 0;

  return (
    <AdminPage
      title={product.name}
      description="Producto, imágenes, variantes e inventario."
      back={{ href: "/admin/products", label: "Productos" }}
      action={product.active ? <Link className="admin-secondary-link" href={`/productos/${product.slug}`} target="_blank" rel="noopener">VER EN TIENDA ↗</Link> : <span className="admin-status">INACTIVO · NO VISIBLE EN TIENDA</span>}
    >
      <section className="admin-panel" aria-labelledby="product-info-title">
        <h2 id="product-info-title">INFORMACIÓN</h2>
        <ProductForm action={updateProduct.bind(null, id)} product={product} categories={categories} primaryCategoryId={primaryResult.data?.category_id} submitLabel="GUARDAR CAMBIOS" />
      </section>

      <section className="admin-panel" aria-labelledby="product-images-title">
        <h2 id="product-images-title">IMÁGENES</h2>
        <p className="admin-help">JPEG, PNG, WebP o AVIF, máximo 5 MB, proporción 4:5. El orden más bajo es la imagen principal; marca una como “hover” para la segunda vista en tarjetas.</p>
        <AdminMutationForm action={uploadProductImage.bind(null, id)} successMessage="Imagen subida." className="admin-form admin-inline-form" resetOnSuccess>
          <label><span>ARCHIVO</span><input name="image" type="file" accept="image/jpeg,image/png,image/webp,image/avif" required /></label>
          <label><span>TEXTO ALTERNATIVO</span><input name="alt_text" required maxLength={240} placeholder="Ej.: Camiseta local 2026, vista frontal" /></label>
          <label><span>ORDEN</span><input name="sort_order" type="number" min="0" step="1" defaultValue={nextImageOrder} /></label>
          <label className="admin-check-label"><input name="is_hover" type="checkbox" /> Hover</label>
          <button type="submit">SUBIR</button>
        </AdminMutationForm>
        {!images.length ? <AdminEmpty>Este producto aún no tiene imágenes. La tienda mostrará un marcador hasta que subas la primera.</AdminEmpty> : (
          <ul className="admin-media-list">
            {images.map((image, index) => {
              const publicUrl = resolveProductImageUrl(image.storage_path, (path) => supabase.storage.from("products").getPublicUrl(path).data.publicUrl);
              return <li key={image.id}>
                <Image src={publicUrl} alt={image.alt_text} width={64} height={80} />
                <AdminMutationForm action={updateProductImage.bind(null, image.id, id)} successMessage="Imagen actualizada." className="admin-form admin-media-form">
                  <label><span>TEXTO ALTERNATIVO</span><input name="alt_text" defaultValue={image.alt_text} required maxLength={240} /></label>
                  <label><span>ORDEN</span><input name="sort_order" type="number" min="0" step="1" defaultValue={image.sort_order} required /></label>
                  <label className="admin-check-label"><input name="is_hover" type="checkbox" defaultChecked={image.is_hover} /> Hover</label>
                  <button type="submit">GUARDAR</button>
                </AdminMutationForm>
                <div className="admin-media-meta">
                  {index === 0 && !image.is_hover ? <span className="admin-status is-active">PRINCIPAL</span> : null}
                  <AdminConfirmAction action={deleteProductImage.bind(null, image.id, id)} itemName="esta imagen" successMessage="Imagen eliminada." />
                </div>
              </li>;
            })}
          </ul>
        )}
      </section>

      <section className="admin-panel" aria-labelledby="product-variants-title">
        <h2 id="product-variants-title">VARIANTES E INVENTARIO</h2>
        <p className="admin-help">Cada talla/color es una variante con su propio SKU y stock. Sin variantes activas con stock, el producto no se puede comprar.</p>
        <AdminMutationForm action={createVariant.bind(null, id)} successMessage="Variante creada." className="admin-form admin-variant-form is-new" resetOnSuccess>
          <VariantFields />
          <button type="submit">AGREGAR VARIANTE</button>
        </AdminMutationForm>
        {!variants.length ? <AdminEmpty>Agrega la primera variante (por ejemplo talla M) para gestionar stock.</AdminEmpty> : (
          <div className="admin-stack">{variants.map((variant) => {
            const itemInventory = inventory.get(variant.id);
            return <div key={variant.id} className="admin-variant-row">
              <AdminMutationForm action={updateVariant.bind(null, variant.id, id)} successMessage={`Variante ${variant.sku} actualizada.`} className="admin-form admin-variant-form">
                <VariantFields sku={variant.sku} size={variant.size} color={variant.color} priceOverride={variant.price_override} stock={itemInventory?.stock ?? 0} threshold={itemInventory?.low_stock_threshold ?? 3} active={variant.active} />
                <button type="submit">GUARDAR</button>
              </AdminMutationForm>
              <AdminConfirmAction action={deleteVariant.bind(null, variant.id, id)} itemName={`la variante ${variant.sku}`} successMessage="Variante eliminada." />
            </div>;
          })}</div>
        )}
      </section>

      <section className="admin-danger-zone" aria-labelledby="product-danger-title">
        <h2 id="product-danger-title">ELIMINAR PRODUCTO</h2>
        <p>Los pedidos históricos conservan su snapshot. Si solo quieres ocultarlo de la tienda, desmarca “Activo” arriba. Esta acción no se puede deshacer.</p>
        <AdminConfirmAction action={deleteProduct.bind(null, id)} label="Eliminar definitivamente" itemName={`el producto ${product.name}`} successMessage="Producto eliminado." redirectTo="/admin/products" />
      </section>
    </AdminPage>
  );
}
