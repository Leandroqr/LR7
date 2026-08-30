import "server-only";

import { PRODUCTS } from "@/lib/products";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import type {
  Product,
  ProductBadge,
  ProductBrand,
  ProductCategory,
} from "@/types/ecommerce";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type ProductImageRow = Database["public"]["Tables"]["product_images"]["Row"];
type VariantRow = Database["public"]["Tables"]["product_variants"]["Row"];
type ProductCategoryRow = Database["public"]["Tables"]["product_categories"]["Row"];
type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];

const PRODUCT_CATEGORIES = new Set<ProductCategory>([
  "FUTBOL_CAMISETAS",
  "FUTBOL_RETRO",
  "FUTBOL_CLUBES",
  "FUTBOL_SELECCIONES",
  "FUTBOL_PERSONALIZADO",
  "TRAINING_CAMISETAS",
  "TRAINING_CAMISILLAS",
  "TRAINING_PANTALONETAS",
  "TRAINING_BUZOS",
  "TRAINING_CONJUNTOS",
  "FUTBOL",
  "TRAINING",
]);

function normalizeCategory(value: string): ProductCategory | null {
  const normalized = value.trim().toUpperCase().replace(/[\s-]+/g, "_");
  return PRODUCT_CATEGORIES.has(normalized as ProductCategory)
    ? (normalized as ProductCategory)
    : null;
}

function normalizeBrand(value: string): ProductBrand | null {
  const normalized = value.trim().toUpperCase();
  return normalized === "FUTBOL" || normalized === "TRAINING" ? normalized : null;
}

function normalizeBadge(value: string | null): ProductBadge {
  const normalized = value?.trim().toUpperCase();
  return normalized === "NUEVO" || normalized === "MAS VENDIDA" || normalized === "LIMITADA"
    ? normalized
    : null;
}

function rowsByProduct<Row extends { product_id: string }>(rows: Row[]) {
  return rows.reduce<Map<string, Row[]>>((grouped, row) => {
    const current = grouped.get(row.product_id) ?? [];
    current.push(row);
    grouped.set(row.product_id, current);
    return grouped;
  }, new Map());
}

export async function getPublicProducts(): Promise<Product[]> {
  if (process.env.CATALOG_SOURCE !== "supabase") return PRODUCTS;

  const supabase = await createSupabaseServerClient();
  if (!supabase) return PRODUCTS;

  const productResult = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (productResult.error || !productResult.data?.length) return PRODUCTS;

  const productIds = productResult.data.map((product) => product.id);
  const [imageResult, variantResult, relationResult, categoryResult] = await Promise.all([
    supabase.from("product_images").select("*").in("product_id", productIds).order("sort_order"),
    supabase.from("product_variants").select("*").in("product_id", productIds).eq("active", true),
    supabase.from("product_categories").select("*").in("product_id", productIds).eq("is_primary", true),
    supabase.from("categories").select("*").eq("active", true),
  ]);

  if (imageResult.error || variantResult.error || relationResult.error || categoryResult.error) {
    return PRODUCTS;
  }

  const imagesByProduct = rowsByProduct<ProductImageRow>(imageResult.data ?? []);
  const variantsByProduct = rowsByProduct<VariantRow>(variantResult.data ?? []);
  const relationByProduct = new Map<string, ProductCategoryRow>(
    (relationResult.data ?? []).map((relation) => [relation.product_id, relation]),
  );
  const categoriesById = new Map<string, CategoryRow>(
    (categoryResult.data ?? []).map((category) => [category.id, category]),
  );

  const products = productResult.data.flatMap((product) => {
    const mapped = mapProduct(
      supabase,
      product,
      imagesByProduct.get(product.id) ?? [],
      variantsByProduct.get(product.id) ?? [],
      relationByProduct.get(product.id),
      categoriesById,
    );
    return mapped ? [mapped] : [];
  });

  return products.length ? products : PRODUCTS;
}

export async function getPublicProductBySlug(slug: string) {
  const products = await getPublicProducts();
  return products.find((product) => product.slug === slug);
}

function mapProduct(
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
  product: ProductRow,
  imageRows: ProductImageRow[],
  variantRows: VariantRow[],
  primaryRelation: ProductCategoryRow | undefined,
  categoriesById: Map<string, CategoryRow>,
): Product | null {
  const categoryRow = primaryRelation ? categoriesById.get(primaryRelation.category_id) : undefined;
  const category = categoryRow ? normalizeCategory(categoryRow.name) : null;
  const brand = normalizeBrand(product.brand);
  if (!category || !brand || !imageRows.length || !variantRows.length) return null;

  const images = imageRows.map((image) => ({
    src: image.storage_path.startsWith("http")
      ? image.storage_path
      : supabase.storage.from("products").getPublicUrl(image.storage_path).data.publicUrl,
    alt: image.alt_text,
  }));
  const hoverIndex = imageRows.findIndex((image) => image.is_hover);
  const hoverImage = images[hoverIndex >= 0 ? hoverIndex : Math.min(1, images.length - 1)];

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category,
    brand,
    team: product.team ?? "Generica",
    badge: normalizeBadge(product.badge),
    personalizable: product.personalizable,
    description: product.description,
    price: { amount: product.price, currency: "COP" },
    brandCompany: { name: "LR7" },
    images,
    hoverImage,
    variants: variantRows.map((variant) => ({
      size: variant.size,
      ...(variant.color ? { color: variant.color } : {}),
      sku: variant.sku,
    })),
  };
}
