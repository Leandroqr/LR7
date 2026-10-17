export function isPersonalizationVariantAvailable(productSlug: string, variant: { size?: string; sku?: string }, stockedSkus: readonly string[] | null) {
  if (stockedSkus === null) return true;
  const sku = variant.sku?.trim() || (variant.size ? `${productSlug}-${variant.size}` : "");
  if (!sku) return true;
  return stockedSkus.includes(sku);
}
