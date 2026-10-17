import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function getStockedPersonalizationSkus(productSlugs: string[]): Promise<string[] | null> {
  if (process.env.CATALOG_SOURCE !== "supabase" || productSlugs.length === 0) return null;
  try {
    const supabase = createSupabaseAdminClient();
    const { data: products, error: productError } = await supabase
      .from("products")
      .select("id, slug")
      .in("slug", productSlugs)
      .eq("active", true);
    if (productError) return null;
    const productIds = (products ?? []).map((product) => product.id);
    if (productIds.length === 0) return [];

    const { data: variants, error: variantError } = await supabase
      .from("product_variants")
      .select("id, sku")
      .in("product_id", productIds)
      .eq("active", true);
    if (variantError) return null;
    const variantIds = (variants ?? []).map((variant) => variant.id);
    if (variantIds.length === 0) return [];

    const { data: inventory, error: inventoryError } = await supabase
      .from("inventory")
      .select("variant_id, stock")
      .in("variant_id", variantIds);
    if (inventoryError) return null;
    const stockedVariants = new Set((inventory ?? []).filter((item) => item.stock > 0).map((item) => item.variant_id));
    return (variants ?? []).filter((variant) => stockedVariants.has(variant.id)).map((variant) => variant.sku);
  } catch {
    return null;
  }
}
