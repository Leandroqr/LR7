"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { AdminActionError, toAdminActionError, type AdminActionResult } from "@/lib/admin/action-result";
import { isRemoteProductImagePath } from "@/lib/admin/product-images";
import { isAdminPreviewEnabled, requireAdmin as requireAdminSession } from "@/lib/auth/admin";
import { assertAdminMutationAllowed } from "@/lib/auth/admin-mutation-guard";
import { getProductImageExtension } from "@/lib/validation/product-image";
import type { Json } from "@/types/database";
import {
  categorySchema,
  checkbox,
  contentItemSchema,
  homeContentTableSchema,
  homeSectionSchema,
  homeSlideSchema,
  inventorySchema,
  navigationSchema,
  fulfillmentStatusSchema,
  productImageSchema,
  productSchema,
  recordIdSchema,
  subscriberStatusSchema,
  siteSettingSchema,
  userRoleSchema,
  variantSchema,
} from "@/lib/validation/admin";

async function requireAdmin() {
  try {
    assertAdminMutationAllowed(isAdminPreviewEnabled());
  } catch (error) {
    throw new AdminActionError(error instanceof Error ? error.message : "Acción no permitida.");
  }
  return requireAdminSession();
}

/**
 * Runs a mutation and converts failures into a serializable result. Redirects and other
 * Next.js control-flow errors (session expired → /admin/login) are rethrown untouched.
 */
async function run<T = null>(mutation: () => Promise<T>): Promise<AdminActionResult<T>> {
  try {
    return { ok: true, data: await mutation() };
  } catch (error) {
    unstable_rethrow(error);
    if (!(error instanceof AdminActionError)) console.error("[admin] mutation failed", error);
    return { ok: false, error: toAdminActionError(error) };
  }
}

function recordId(raw: unknown) {
  const result = recordIdSchema.safeParse(raw);
  if (!result.success) throw new AdminActionError("El registro no es válido. Recarga la página e inténtalo de nuevo.");
  return result.data;
}

function value(formData: FormData, key: string) {
  return formData.get(key) ?? "";
}

function throwMutationError(error: { code?: string; message: string } | null) {
  if (!error) return;
  if (error.code === "23505") throw new AdminActionError("Ya existe un registro con esos datos (slug, SKU o clave repetidos).");
  if (error.code === "23503") throw new AdminActionError("El registro está en uso o una referencia seleccionada ya no existe.");
  if (error.code === "23514") throw new AdminActionError("Uno de los valores no cumple las reglas del catálogo.");
  if (error.code === "42501") throw new AdminActionError("Tu sesión no tiene permisos para esta acción.");
  console.error("[admin] supabase error", error);
  throw new AdminActionError("No fue posible guardar los cambios. Revisa los datos e inténtalo de nuevo.");
}

/** Updates that match no rows succeed silently in PostgREST; surface them as stale data. */
function assertUpdated(data: unknown[] | null) {
  if (!data?.length) throw new AdminActionError("El registro ya no existe. Recarga la página.");
}

function jsonValue(formData: FormData, key: string): Json {
  const raw = value(formData, key);
  if (typeof raw !== "string" || !raw.trim()) return {};
  try {
    return JSON.parse(raw) as Json;
  } catch {
    throw new AdminActionError("La configuración debe ser JSON válido.");
  }
}

/** Public pages read catalog, CMS and navigation data; refresh every cached route at once. */
function revalidatePublicSite() {
  revalidatePath("/", "layout");
}

function productFields(formData: FormData) {
  return productSchema.parse({
    name: value(formData, "name"),
    slug: value(formData, "slug"),
    description: value(formData, "description"),
    price: value(formData, "price"),
    compare_at_price: value(formData, "compare_at_price"),
    brand: value(formData, "brand"),
    team: value(formData, "team"),
    badge: value(formData, "badge"),
    category_id: value(formData, "category_id"),
    personalizable: checkbox(formData, "personalizable"),
    featured: checkbox(formData, "featured"),
    active: checkbox(formData, "active"),
  });
}

function variantFields(formData: FormData) {
  return variantSchema.parse({
    sku: value(formData, "sku"),
    size: value(formData, "size"),
    color: value(formData, "color"),
    price_override: value(formData, "price_override"),
    stock: value(formData, "stock"),
    low_stock_threshold: value(formData, "low_stock_threshold"),
    active: checkbox(formData, "active"),
  });
}

function categoryFields(formData: FormData) {
  return categorySchema.parse({
    name: value(formData, "name"),
    slug: value(formData, "slug"),
    description: value(formData, "description"),
    parent_id: value(formData, "parent_id"),
    sort_order: value(formData, "sort_order"),
    active: checkbox(formData, "active"),
  });
}

function homeSlideFields(formData: FormData) {
  return homeSlideSchema.parse({
    image_path: value(formData, "image_path"),
    eyebrow: value(formData, "eyebrow"),
    title: value(formData, "title"),
    accent_text: value(formData, "accent_text"),
    subtitle: value(formData, "subtitle"),
    cta_label: value(formData, "cta_label"),
    cta_href: value(formData, "cta_href"),
    sort_order: value(formData, "sort_order"),
    active: checkbox(formData, "active"),
  });
}

function homeSectionFields(formData: FormData) {
  return homeSectionSchema.parse({
    section_key: value(formData, "section_key"),
    section_type: value(formData, "section_type"),
    title: value(formData, "title"),
    eyebrow: value(formData, "eyebrow"),
    subtitle: value(formData, "subtitle"),
    cta_label: value(formData, "cta_label"),
    cta_href: value(formData, "cta_href"),
    sort_order: value(formData, "sort_order"),
    active: checkbox(formData, "active"),
  });
}

function navigationFields(formData: FormData) {
  return navigationSchema.parse({
    location: value(formData, "location"),
    label: value(formData, "label"),
    href: value(formData, "href"),
    sort_order: value(formData, "sort_order"),
    active: checkbox(formData, "active"),
  });
}

function contentFields(formData: FormData) {
  const parsed = contentItemSchema.parse({
    page_key: value(formData, "page_key"),
    content_key: value(formData, "content_key"),
    title: value(formData, "title"),
    eyebrow: value(formData, "eyebrow"),
    body: value(formData, "body"),
    image_path: value(formData, "image_path"),
    cta_label: value(formData, "cta_label"),
    cta_href: value(formData, "cta_href"),
    configuration: jsonValue(formData, "configuration"),
    sort_order: value(formData, "sort_order"),
    active: checkbox(formData, "active"),
  });
  return { ...parsed, configuration: parsed.configuration as Json };
}

type AdminSupabase = Awaited<ReturnType<typeof requireAdminSession>>["supabase"];

/**
 * Replaces the primary category without leaving the product uncategorized if a step fails.
 * A unique index allows only one primary row per product, so the existing row is re-pointed
 * in a single UPDATE instead of delete + insert.
 */
async function setPrimaryCategory(supabase: AdminSupabase, productId: string, categoryId: string | null) {
  if (!categoryId) {
    const { error } = await supabase.from("product_categories").delete().eq("product_id", productId).eq("is_primary", true);
    throwMutationError(error);
    return;
  }

  const { error: duplicateError } = await supabase
    .from("product_categories")
    .delete()
    .eq("product_id", productId)
    .eq("category_id", categoryId)
    .eq("is_primary", false);
  throwMutationError(duplicateError);

  const { data: moved, error: moveError } = await supabase
    .from("product_categories")
    .update({ category_id: categoryId })
    .eq("product_id", productId)
    .eq("is_primary", true)
    .select("product_id");
  throwMutationError(moveError);
  if (moved?.length) return;

  const { error: insertError } = await supabase
    .from("product_categories")
    .insert({ product_id: productId, category_id: categoryId, is_primary: true });
  throwMutationError(insertError);
}

async function removeStorageFiles(supabase: AdminSupabase, paths: string[]) {
  const storagePaths = paths.filter((path) => !isRemoteProductImagePath(path));
  if (!storagePaths.length) return;
  const { error } = await supabase.storage.from("products").remove(storagePaths);
  if (error) console.error("[admin] orphaned product images", storagePaths, error);
}

export async function createProduct(formData: FormData) {
  return run(async () => {
    const { supabase } = await requireAdmin();
    const { category_id, ...product } = productFields(formData);
    const { data, error } = await supabase.from("products").insert(product).select("id").single();
    throwMutationError(error);
    if (!data) throw new AdminActionError("No fue posible crear el producto.");

    if (category_id) {
      const { error: categoryError } = await supabase
        .from("product_categories")
        .insert({ product_id: data.id, category_id, is_primary: true });
      if (categoryError) {
        const { error: rollbackError } = await supabase.from("products").delete().eq("id", data.id);
        if (rollbackError) throw new AdminActionError("No se pudo asignar la categoría ni revertir el producto. Contacta con soporte.");
        throwMutationError(categoryError);
      }
    }

    revalidatePath("/admin/products");
    revalidatePublicSite();
    return data.id;
  });
}

export async function updateProduct(rawProductId: string, formData: FormData) {
  return run(async () => {
    const productId = recordId(rawProductId);
    const { supabase } = await requireAdmin();
    const { category_id, ...product } = productFields(formData);
    const { data, error } = await supabase.from("products").update(product).eq("id", productId).select("id");
    throwMutationError(error);
    assertUpdated(data);
    await setPrimaryCategory(supabase, productId, category_id);

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${productId}`);
    revalidatePublicSite();
    return null;
  });
}

export async function deleteProduct(rawProductId: string) {
  return run(async () => {
    const productId = recordId(rawProductId);
    const { supabase } = await requireAdmin();
    const { data: images, error: imageError } = await supabase.from("product_images").select("storage_path").eq("product_id", productId);
    throwMutationError(imageError);
    const { error } = await supabase.from("products").delete().eq("id", productId);
    throwMutationError(error);
    await removeStorageFiles(supabase, (images ?? []).map((image) => image.storage_path));
    revalidatePath("/admin/products");
    revalidatePublicSite();
    return null;
  });
}

export async function toggleProduct(rawProductId: string, active: boolean) {
  return run(async () => {
    const productId = recordId(rawProductId);
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase.from("products").update({ active: !active }).eq("id", productId).select("id");
    throwMutationError(error);
    assertUpdated(data);
    revalidatePath("/admin/products");
    revalidatePublicSite();
    return null;
  });
}

export async function uploadProductImage(rawProductId: string, formData: FormData) {
  return run(async () => {
    const productId = recordId(rawProductId);
    const { supabase } = await requireAdmin();
    const file = formData.get("image");
    if (!(file instanceof File) || file.size === 0) throw new AdminActionError("Selecciona una imagen.");
    const signature = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    const extension = getProductImageExtension(file.type, file.size, signature);
    if (!extension) throw new AdminActionError("La imagen debe ser JPEG, PNG, WebP o AVIF y pesar máximo 5 MB.");
    const fields = productImageSchema.parse({
      alt_text: value(formData, "alt_text"),
      sort_order: value(formData, "sort_order"),
      is_hover: checkbox(formData, "is_hover"),
    });

    const path = `${productId}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from("products").upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
    throwMutationError(uploadError);
    const { error } = await supabase.from("product_images").insert({ product_id: productId, storage_path: path, ...fields });
    if (error) {
      await removeStorageFiles(supabase, [path]);
      throwMutationError(error);
    }
    revalidatePath(`/admin/products/${productId}`);
    revalidatePublicSite();
    return null;
  });
}

export async function updateProductImage(rawImageId: string, rawProductId: string, formData: FormData) {
  return run(async () => {
    const imageId = recordId(rawImageId);
    const productId = recordId(rawProductId);
    const { supabase } = await requireAdmin();
    const fields = productImageSchema.parse({
      alt_text: value(formData, "alt_text"),
      sort_order: value(formData, "sort_order"),
      is_hover: checkbox(formData, "is_hover"),
    });
    const { data, error } = await supabase
      .from("product_images")
      .update(fields)
      .eq("id", imageId)
      .eq("product_id", productId)
      .select("id");
    throwMutationError(error);
    assertUpdated(data);
    revalidatePath(`/admin/products/${productId}`);
    revalidatePublicSite();
    return null;
  });
}

export async function deleteProductImage(rawImageId: string, rawProductId: string) {
  return run(async () => {
    const imageId = recordId(rawImageId);
    const productId = recordId(rawProductId);
    const { supabase } = await requireAdmin();
    const { data: image, error: lookupError } = await supabase
      .from("product_images")
      .select("product_id, storage_path")
      .eq("id", imageId)
      .maybeSingle();
    throwMutationError(lookupError);
    if (image?.product_id !== productId) throw new AdminActionError("La imagen ya no pertenece a este producto.");

    const { error } = await supabase.from("product_images").delete().eq("id", imageId).eq("product_id", productId);
    throwMutationError(error);
    await removeStorageFiles(supabase, [image.storage_path]);
    revalidatePath(`/admin/products/${productId}`);
    revalidatePublicSite();
    return null;
  });
}

export async function createVariant(rawProductId: string, formData: FormData) {
  return run(async () => {
    const productId = recordId(rawProductId);
    const { supabase } = await requireAdmin();
    const { stock, low_stock_threshold, ...variant } = variantFields(formData);
    const { data, error } = await supabase
      .from("product_variants")
      .insert({ ...variant, product_id: productId })
      .select("id")
      .single();
    throwMutationError(error);
    if (!data) throw new AdminActionError("No fue posible crear la variante.");
    const { error: inventoryError } = await supabase
      .from("inventory")
      .insert({ variant_id: data.id, stock, low_stock_threshold });
    if (inventoryError) {
      const { error: rollbackError } = await supabase.from("product_variants").delete().eq("id", data.id);
      if (rollbackError) throw new AdminActionError("No se pudo crear el inventario ni revertir la variante. Contacta con soporte.");
      throwMutationError(inventoryError);
    }
    revalidatePath(`/admin/products/${productId}`);
    revalidatePath("/admin/inventory");
    revalidatePublicSite();
    return null;
  });
}

export async function updateVariant(rawVariantId: string, rawProductId: string, formData: FormData) {
  return run(async () => {
    const variantId = recordId(rawVariantId);
    const productId = recordId(rawProductId);
    const { supabase } = await requireAdmin();
    const { stock, low_stock_threshold, ...variant } = variantFields(formData);
    const { data, error } = await supabase
      .from("product_variants")
      .update(variant)
      .eq("id", variantId)
      .eq("product_id", productId)
      .select("id");
    throwMutationError(error);
    assertUpdated(data);
    const { error: inventoryError } = await supabase
      .from("inventory")
      .upsert({ variant_id: variantId, stock, low_stock_threshold });
    throwMutationError(inventoryError);
    revalidatePath(`/admin/products/${productId}`);
    revalidatePath("/admin/inventory");
    revalidatePublicSite();
    return null;
  });
}

export async function deleteVariant(rawVariantId: string, rawProductId: string) {
  return run(async () => {
    const variantId = recordId(rawVariantId);
    const productId = recordId(rawProductId);
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("product_variants").delete().eq("id", variantId).eq("product_id", productId);
    throwMutationError(error);
    revalidatePath(`/admin/products/${productId}`);
    revalidatePath("/admin/inventory");
    revalidatePublicSite();
    return null;
  });
}

export async function updateInventory(rawVariantId: string, formData: FormData) {
  return run(async () => {
    const variantId = recordId(rawVariantId);
    const { supabase } = await requireAdmin();
    const parsed = inventorySchema.parse({
      stock: value(formData, "stock"),
      low_stock_threshold: value(formData, "low_stock_threshold"),
    });
    const { error } = await supabase.from("inventory").upsert({ variant_id: variantId, ...parsed });
    throwMutationError(error);
    revalidatePath("/admin/inventory");
    revalidatePath("/admin/dashboard");
    revalidatePublicSite();
    return null;
  });
}

export async function createCategory(formData: FormData) {
  return run(async () => {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("categories").insert(categoryFields(formData));
    throwMutationError(error);
    revalidatePath("/admin/categories");
    revalidatePublicSite();
    return null;
  });
}

export async function updateCategory(rawCategoryId: string, formData: FormData) {
  return run(async () => {
    const categoryId = recordId(rawCategoryId);
    const { supabase } = await requireAdmin();
    const parsed = categoryFields(formData);
    if (parsed.parent_id === categoryId) throw new AdminActionError("Una categoría no puede ser su propio padre.");
    const { data, error } = await supabase.from("categories").update(parsed).eq("id", categoryId).select("id");
    throwMutationError(error);
    assertUpdated(data);
    revalidatePath("/admin/categories");
    revalidatePublicSite();
    return null;
  });
}

export async function deleteCategory(rawCategoryId: string) {
  return run(async () => {
    const categoryId = recordId(rawCategoryId);
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("categories").delete().eq("id", categoryId);
    throwMutationError(error);
    revalidatePath("/admin/categories");
    revalidatePublicSite();
    return null;
  });
}

export async function createHomeSlide(formData: FormData) {
  return run(async () => {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("home_slides").insert(homeSlideFields(formData));
    throwMutationError(error);
    revalidatePath("/admin/home");
    revalidatePublicSite();
    return null;
  });
}

export async function updateHomeSlide(rawId: string, formData: FormData) {
  return run(async () => {
    const id = recordId(rawId);
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase.from("home_slides").update(homeSlideFields(formData)).eq("id", id).select("id");
    throwMutationError(error);
    assertUpdated(data);
    revalidatePath("/admin/home");
    revalidatePublicSite();
    return null;
  });
}

export async function createHomeSection(formData: FormData) {
  return run(async () => {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("home_sections").insert(homeSectionFields(formData));
    throwMutationError(error);
    revalidatePath("/admin/home");
    revalidatePublicSite();
    return null;
  });
}

export async function updateHomeSection(rawId: string, formData: FormData) {
  return run(async () => {
    const id = recordId(rawId);
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase.from("home_sections").update(homeSectionFields(formData)).eq("id", id).select("id");
    throwMutationError(error);
    assertUpdated(data);
    revalidatePath("/admin/home");
    revalidatePublicSite();
    return null;
  });
}

export async function deleteHomeContent(rawTable: string, rawId: string) {
  return run(async () => {
    // Bound arguments travel through the client: never let it choose an arbitrary table.
    const table = homeContentTableSchema.parse(rawTable);
    const id = recordId(rawId);
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from(table).delete().eq("id", id);
    throwMutationError(error);
    revalidatePath("/admin/home");
    revalidatePublicSite();
    return null;
  });
}

export async function toggleHomeContent(rawTable: string, rawId: string, active: boolean) {
  return run(async () => {
    const table = homeContentTableSchema.parse(rawTable);
    const id = recordId(rawId);
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase.from(table).update({ active: !active }).eq("id", id).select("id");
    throwMutationError(error);
    assertUpdated(data);
    revalidatePath("/admin/home");
    revalidatePublicSite();
    return null;
  });
}

export async function createNavigationItem(formData: FormData) {
  return run(async () => {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("navigation_items").insert(navigationFields(formData));
    throwMutationError(error);
    revalidatePath("/admin/navigation");
    revalidatePublicSite();
    return null;
  });
}

export async function updateNavigationItem(rawId: string, formData: FormData) {
  return run(async () => {
    const id = recordId(rawId);
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase.from("navigation_items").update(navigationFields(formData)).eq("id", id).select("id");
    throwMutationError(error);
    assertUpdated(data);
    revalidatePath("/admin/navigation");
    revalidatePublicSite();
    return null;
  });
}

export async function deleteNavigationItem(rawId: string) {
  return run(async () => {
    const id = recordId(rawId);
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("navigation_items").delete().eq("id", id);
    throwMutationError(error);
    revalidatePath("/admin/navigation");
    revalidatePublicSite();
    return null;
  });
}

export async function updateOrderStatus(rawOrderId: string, formData: FormData) {
  return run(async () => {
    const orderId = recordId(rawOrderId);
    const { supabase } = await requireAdmin();
    const status = fulfillmentStatusSchema.parse(value(formData, "status"));
    const { error } = await supabase.rpc("set_order_fulfillment_status", {
      target_order_id: orderId,
      new_status: status,
    });
    if (error?.code === "P0001") throw new AdminActionError("El pedido no está pagado o está retenido para revisión.");
    if (error?.code === "22023") throw new AdminActionError("Ese cambio de estado no es válido. Recarga la página.");
    throwMutationError(error);
    revalidatePath("/admin/orders");
    revalidatePath("/admin/dashboard");
    return null;
  });
}

export async function updateUserRole(rawUserId: string, formData: FormData) {
  return run(async () => {
    const userId = recordId(rawUserId);
    const { supabase, user } = await requireAdmin();
    const role = userRoleSchema.parse(value(formData, "role"));
    if (userId === user.id && role !== "ADMIN") throw new AdminActionError("No puedes quitarte tu propio rol ADMIN.");
    const { error } = await supabase.rpc("set_user_role", {
      target_user_id: userId,
      new_role: role,
    });
    throwMutationError(error);
    revalidatePath("/admin/users");
    return null;
  });
}

export async function updateSubscriberStatus(rawSubscriberId: string, formData: FormData) {
  return run(async () => {
    const subscriberId = recordId(rawSubscriberId);
    const { supabase } = await requireAdmin();
    const status = subscriberStatusSchema.parse(value(formData, "status"));
    const { data, error } = await supabase.from("newsletter_subscribers").update({ status }).eq("id", subscriberId).select("id");
    throwMutationError(error);
    assertUpdated(data);
    revalidatePath("/admin/newsletter");
    return null;
  });
}

export async function deleteSubscriber(rawSubscriberId: string) {
  return run(async () => {
    const subscriberId = recordId(rawSubscriberId);
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("newsletter_subscribers").delete().eq("id", subscriberId);
    throwMutationError(error);
    revalidatePath("/admin/newsletter");
    return null;
  });
}

export async function createContentItem(formData: FormData) {
  return run(async () => {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("content_items").insert(contentFields(formData));
    throwMutationError(error);
    revalidatePath("/admin/content");
    revalidatePublicSite();
    return null;
  });
}

export async function updateContentItem(rawId: string, formData: FormData) {
  return run(async () => {
    const id = recordId(rawId);
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase.from("content_items").update(contentFields(formData)).eq("id", id).select("id");
    throwMutationError(error);
    assertUpdated(data);
    revalidatePath("/admin/content");
    revalidatePublicSite();
    return null;
  });
}

export async function deleteContentItem(rawId: string) {
  return run(async () => {
    const id = recordId(rawId);
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("content_items").delete().eq("id", id);
    throwMutationError(error);
    revalidatePath("/admin/content");
    revalidatePublicSite();
    return null;
  });
}

export async function upsertSiteSetting(formData: FormData) {
  return run(async () => {
    const { supabase } = await requireAdmin();
    const parsed = siteSettingSchema.parse({
      setting_key: value(formData, "setting_key"),
      value: jsonValue(formData, "value"),
      active: checkbox(formData, "active"),
    });
    const { error } = await supabase
      .from("site_settings")
      .upsert({ ...parsed, value: parsed.value as Json }, { onConflict: "setting_key" });
    throwMutationError(error);
    revalidatePath("/admin/content");
    revalidatePublicSite();
    return null;
  });
}
