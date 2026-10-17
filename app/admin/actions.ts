"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRemoteProductImagePath } from "@/lib/admin/product-images";
import { isAdminPreviewEnabled, requireAdmin as requireAdminSession } from "@/lib/auth/admin";
import { assertAdminMutationAllowed } from "@/lib/auth/admin-mutation-guard";
import { getProductImageExtension } from "@/lib/validation/product-image";
import type { Json } from "@/types/database";
import {
  categorySchema,
  checkbox,
  contentItemSchema,
  homeSectionSchema,
  homeSlideSchema,
  inventorySchema,
  navigationSchema,
  fulfillmentStatusSchema,
  productSchema,
  subscriberStatusSchema,
  siteSettingSchema,
  userRoleSchema,
  variantSchema,
} from "@/lib/validation/admin";

async function requireAdmin() {
  assertAdminMutationAllowed(isAdminPreviewEnabled());
  return requireAdminSession();
}

function value(formData: FormData, key: string) {
  return formData.get(key) ?? "";
}

function throwMutationError(error: { code?: string; message: string } | null) {
  if (!error) return;
  if (error.code === "23505") throw new Error("Ya existe un registro con esos datos.");
  if (error.code === "23503") throw new Error("Una referencia seleccionada ya no existe.");
  if (error.code === "23514") throw new Error("Uno de los valores no cumple las reglas del catálogo.");
  throw new Error("No fue posible guardar los cambios. Revisa los datos e inténtalo de nuevo.");
}

function jsonValue(formData: FormData, key: string): Json {
  const raw = value(formData, key);
  if (typeof raw !== "string" || !raw.trim()) return {};
  try {
    return JSON.parse(raw) as Json;
  } catch {
    throw new Error("La configuración debe ser JSON válido.");
  }
}

export async function createProduct(formData: FormData) {
  const { supabase } = await requireAdmin();
  const parsed = productSchema.parse({
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
  const { category_id, ...product } = parsed;
  const { data, error } = await supabase.from("products").insert(product).select("id").single();
  throwMutationError(error);
  if (!data) throw new Error("No fue posible crear el producto.");

  if (category_id) {
    const { error: categoryError } = await supabase
      .from("product_categories")
      .insert({ product_id: data.id, category_id, is_primary: true });
    if (categoryError) {
      const { error: rollbackError } = await supabase.from("products").delete().eq("id", data.id);
      if (rollbackError) throw new Error("No se pudo asignar la categoría ni revertir el producto. Contacta con soporte.");
      throwMutationError(categoryError);
    }
  }

  revalidatePath("/admin/products");
  return data.id;
}

export async function updateProduct(productId: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const parsed = productSchema.parse({
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
  const { category_id, ...product } = parsed;
  const { error } = await supabase.from("products").update(product).eq("id", productId);
  throwMutationError(error);

  const { error: deleteCategoryError } = await supabase
    .from("product_categories")
    .delete()
    .eq("product_id", productId)
    .eq("is_primary", true);
  throwMutationError(deleteCategoryError);
  if (category_id) {
    const { error: categoryError } = await supabase
      .from("product_categories")
      .upsert({ product_id: productId, category_id, is_primary: true });
    throwMutationError(categoryError);
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/tienda");
}

export async function deleteProduct(productId: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("products").delete().eq("id", productId);
  throwMutationError(error);
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function toggleProduct(productId: string, active: boolean) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("products").update({ active: !active }).eq("id", productId);
  throwMutationError(error);
  revalidatePath("/admin/products");
}

export async function uploadProductImage(productId: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const file = formData.get("image");
  const rawAltText = formData.get("alt_text");
  const altText = typeof rawAltText === "string" ? rawAltText.trim() : "";
  if (!(file instanceof File) || file.size === 0) throw new Error("Selecciona una imagen.");
  const signature = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const extension = getProductImageExtension(file.type, file.size, signature);
  if (!extension) {
    throw new Error("La imagen debe ser JPEG, PNG, WebP o AVIF y pesar máximo 5 MB.");
  }
  if (!altText || altText.length > 240) throw new Error("El texto alternativo es obligatorio.");

  const path = `${productId}/${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage.from("products").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  throwMutationError(uploadError);
  const { error } = await supabase.from("product_images").insert({
    product_id: productId,
    storage_path: path,
    alt_text: altText,
    is_hover: checkbox(formData, "is_hover"),
    sort_order: Number(value(formData, "sort_order")) || 0,
  });
  if (error) {
    await supabase.storage.from("products").remove([path]);
    throwMutationError(error);
  }
  revalidatePath(`/admin/products/${productId}`);
}

export async function deleteProductImage(imageId: string, productId: string) {
  const { supabase } = await requireAdmin();
  const { data: image, error: lookupError } = await supabase
    .from("product_images")
    .select("product_id, storage_path")
    .eq("id", imageId)
    .maybeSingle();
  throwMutationError(lookupError);
  if (image?.product_id !== productId) throw new Error("La imagen ya no pertenece a este producto.");

  if (!isRemoteProductImagePath(image.storage_path)) {
    const { error: storageError } = await supabase.storage.from("products").remove([image.storage_path]);
    throwMutationError(storageError);
  }

  const { error } = await supabase.from("product_images").delete().eq("id", imageId).eq("product_id", productId);
  throwMutationError(error);
  revalidatePath(`/admin/products/${productId}`);
}

export async function createVariant(productId: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const parsed = variantSchema.parse({
    sku: value(formData, "sku"),
    size: value(formData, "size"),
    color: value(formData, "color"),
    price_override: value(formData, "price_override"),
    stock: value(formData, "stock"),
    low_stock_threshold: value(formData, "low_stock_threshold"),
    active: checkbox(formData, "active"),
  });
  const { stock, low_stock_threshold, ...variant } = parsed;
  const { data, error } = await supabase
    .from("product_variants")
    .insert({ ...variant, product_id: productId })
    .select("id")
    .single();
  throwMutationError(error);
  if (!data) throw new Error("No fue posible crear la variante.");
  const { error: inventoryError } = await supabase
    .from("inventory")
    .insert({ variant_id: data.id, stock, low_stock_threshold });
  if (inventoryError) {
    const { error: rollbackError } = await supabase.from("product_variants").delete().eq("id", data.id);
    if (rollbackError) throw new Error("No se pudo crear el inventario ni revertir la variante. Contacta con soporte.");
    throwMutationError(inventoryError);
  }
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/admin/inventory");
}

export async function updateVariant(variantId: string, productId: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const parsed = variantSchema.parse({
    sku: value(formData, "sku"),
    size: value(formData, "size"),
    color: value(formData, "color"),
    price_override: value(formData, "price_override"),
    stock: value(formData, "stock"),
    low_stock_threshold: value(formData, "low_stock_threshold"),
    active: checkbox(formData, "active"),
  });
  const { stock, low_stock_threshold, ...variant } = parsed;
  const { error } = await supabase.from("product_variants").update(variant).eq("id", variantId);
  throwMutationError(error);
  const { error: inventoryError } = await supabase
    .from("inventory")
    .upsert({ variant_id: variantId, stock, low_stock_threshold });
  throwMutationError(inventoryError);
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/admin/inventory");
}

export async function deleteVariant(variantId: string, productId: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("product_variants").delete().eq("id", variantId);
  throwMutationError(error);
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/admin/inventory");
}

export async function updateInventory(variantId: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const parsed = inventorySchema.parse({
    stock: value(formData, "stock"),
    low_stock_threshold: value(formData, "low_stock_threshold"),
  });
  const { error } = await supabase
    .from("inventory")
    .upsert({ variant_id: variantId, ...parsed });
  throwMutationError(error);
  revalidatePath("/admin/inventory");
}

export async function createCategory(formData: FormData) {
  const { supabase } = await requireAdmin();
  const parsed = categorySchema.parse({
    name: value(formData, "name"),
    slug: value(formData, "slug"),
    description: value(formData, "description"),
    parent_id: value(formData, "parent_id"),
    sort_order: value(formData, "sort_order"),
    active: checkbox(formData, "active"),
  });
  const { error } = await supabase.from("categories").insert(parsed);
  throwMutationError(error);
  revalidatePath("/admin/categories");
}

export async function updateCategory(categoryId: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const parsed = categorySchema.parse({
    name: value(formData, "name"),
    slug: value(formData, "slug"),
    description: value(formData, "description"),
    parent_id: value(formData, "parent_id"),
    sort_order: value(formData, "sort_order"),
    active: checkbox(formData, "active"),
  });
  if (parsed.parent_id === categoryId) throw new Error("Una categoría no puede ser su propio padre.");
  const { error } = await supabase.from("categories").update(parsed).eq("id", categoryId);
  throwMutationError(error);
  revalidatePath("/admin/categories");
}

export async function deleteCategory(categoryId: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("categories").delete().eq("id", categoryId);
  throwMutationError(error);
  revalidatePath("/admin/categories");
}

export async function createHomeSlide(formData: FormData) {
  const { supabase } = await requireAdmin();
  const parsed = homeSlideSchema.parse({
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
  const { error } = await supabase.from("home_slides").insert(parsed);
  throwMutationError(error);
  revalidatePath("/admin/home");
}

export async function updateHomeSlide(id: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const parsed = homeSlideSchema.parse({
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
  const { error } = await supabase.from("home_slides").update(parsed).eq("id", id);
  throwMutationError(error);
  revalidatePath("/admin/home");
}

export async function createHomeSection(formData: FormData) {
  const { supabase } = await requireAdmin();
  const parsed = homeSectionSchema.parse({
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
  const { error } = await supabase.from("home_sections").insert(parsed);
  throwMutationError(error);
  revalidatePath("/admin/home");
}

export async function updateHomeSection(id: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const parsed = homeSectionSchema.parse({
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
  const { error } = await supabase.from("home_sections").update(parsed).eq("id", id);
  throwMutationError(error);
  revalidatePath("/admin/home");
}

export async function deleteHomeContent(table: "home_slides" | "home_sections", id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from(table).delete().eq("id", id);
  throwMutationError(error);
  revalidatePath("/admin/home");
}

export async function toggleHomeContent(
  table: "home_slides" | "home_sections",
  id: string,
  active: boolean,
) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from(table).update({ active: !active }).eq("id", id);
  throwMutationError(error);
  revalidatePath("/admin/home");
}

export async function createNavigationItem(formData: FormData) {
  const { supabase } = await requireAdmin();
  const parsed = navigationSchema.parse({
    location: value(formData, "location"),
    label: value(formData, "label"),
    href: value(formData, "href"),
    sort_order: value(formData, "sort_order"),
    active: checkbox(formData, "active"),
  });
  const { error } = await supabase.from("navigation_items").insert(parsed);
  throwMutationError(error);
  revalidatePath("/admin/navigation");
}

export async function updateNavigationItem(id: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const parsed = navigationSchema.parse({
    location: value(formData, "location"),
    label: value(formData, "label"),
    href: value(formData, "href"),
    sort_order: value(formData, "sort_order"),
    active: checkbox(formData, "active"),
  });
  const { error } = await supabase.from("navigation_items").update(parsed).eq("id", id);
  throwMutationError(error);
  revalidatePath("/admin/navigation");
}

export async function deleteNavigationItem(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("navigation_items").delete().eq("id", id);
  throwMutationError(error);
  revalidatePath("/admin/navigation");
}

export async function updateOrderStatus(orderId: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const status = fulfillmentStatusSchema.parse(value(formData, "status"));
  const { error } = await supabase.rpc("set_order_fulfillment_status", {
    target_order_id: orderId,
    new_status: status,
  });
  throwMutationError(error);
  revalidatePath("/admin/orders");
}

export async function updateUserRole(userId: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const role = userRoleSchema.parse(value(formData, "role"));
  const { error } = await supabase.rpc("set_user_role", {
    target_user_id: userId,
    new_role: role,
  });
  throwMutationError(error);
  revalidatePath("/admin/users");
}

export async function updateSubscriberStatus(subscriberId: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const status = subscriberStatusSchema.parse(value(formData, "status"));
  const { error } = await supabase
    .from("newsletter_subscribers")
    .update({ status })
    .eq("id", subscriberId);
  throwMutationError(error);
  revalidatePath("/admin/newsletter");
}

export async function deleteSubscriber(subscriberId: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("newsletter_subscribers").delete().eq("id", subscriberId);
  throwMutationError(error);
  revalidatePath("/admin/newsletter");
}

export async function createContentItem(formData: FormData) {
  const { supabase } = await requireAdmin();
  const parsed = contentItemSchema.parse({
    page_key: value(formData, "page_key"), content_key: value(formData, "content_key"), title: value(formData, "title"), eyebrow: value(formData, "eyebrow"), body: value(formData, "body"), image_path: value(formData, "image_path"), cta_label: value(formData, "cta_label"), cta_href: value(formData, "cta_href"), configuration: jsonValue(formData, "configuration"), sort_order: value(formData, "sort_order"), active: checkbox(formData, "active"),
  });
  const { error } = await supabase.from("content_items").insert({ ...parsed, configuration: parsed.configuration as Json });
  throwMutationError(error);
  revalidatePath("/"); revalidatePath("/preguntas-frecuentes"); revalidatePath("/envios"); revalidatePath("/cambios-y-devoluciones"); revalidatePath("/guia-de-tallas"); revalidatePath("/admin/content");
}

export async function updateContentItem(id: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const parsed = contentItemSchema.parse({
    page_key: value(formData, "page_key"), content_key: value(formData, "content_key"), title: value(formData, "title"), eyebrow: value(formData, "eyebrow"), body: value(formData, "body"), image_path: value(formData, "image_path"), cta_label: value(formData, "cta_label"), cta_href: value(formData, "cta_href"), configuration: jsonValue(formData, "configuration"), sort_order: value(formData, "sort_order"), active: checkbox(formData, "active"),
  });
  const { error } = await supabase.from("content_items").update({ ...parsed, configuration: parsed.configuration as Json }).eq("id", id);
  throwMutationError(error);
  revalidatePath("/"); revalidatePath("/preguntas-frecuentes"); revalidatePath("/envios"); revalidatePath("/cambios-y-devoluciones"); revalidatePath("/guia-de-tallas"); revalidatePath("/admin/content");
}

export async function deleteContentItem(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("content_items").delete().eq("id", id);
  throwMutationError(error);
  revalidatePath("/"); revalidatePath("/preguntas-frecuentes"); revalidatePath("/envios"); revalidatePath("/cambios-y-devoluciones"); revalidatePath("/guia-de-tallas"); revalidatePath("/admin/content");
}

export async function upsertSiteSetting(formData: FormData) {
  const { supabase } = await requireAdmin();
  const parsed = siteSettingSchema.parse({ setting_key: value(formData, "setting_key"), value: jsonValue(formData, "value"), active: checkbox(formData, "active") });
  const { error } = await supabase.from("site_settings").upsert({ ...parsed, value: parsed.value as Json }, { onConflict: "setting_key" });
  throwMutationError(error);
  revalidatePath("/"); revalidatePath("/admin/content");
}
