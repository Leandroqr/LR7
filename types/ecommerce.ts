export type ProductCategory = 
  // Football subcategories
  | "FUTBOL_CAMISETAS" 
  | "FUTBOL_RETRO" 
  | "FUTBOL_CLUBES" 
  | "FUTBOL_SELECCIONES" 
  | "FUTBOL_PERSONALIZADO"
  // Training subcategories
  | "TRAINING_CAMISETAS"
  | "TRAINING_CAMISILLAS"
  | "TRAINING_PANTALONETAS"
  | "TRAINING_BUZOS"
  | "TRAINING_CONJUNTOS"
  // Legacy/main categories for filtering
  | "FUTBOL"
  | "TRAINING";

export type ProductBrand = "FUTBOL" | "TRAINING";

export type ProductBadge = "NUEVO" | "MAS VENDIDA" | "LIMITADA" | null;

export type Price = {
  amount: number;
  currency: "COP";
};

export type ProductImage = {
  src: string;
  alt: string;
};

export type Brand = {
  name: string;
};

export type ProductVariant = {
  size: string;
  color?: string;
  sku?: string;
};

export type CustomizationSettings = {
  enabled: boolean;
  price: number;
  nameMaxLength: number;
  numberMin: number;
  numberMax: number;
  placement: "back";
};

export type ProductId = number | string;

export type Product = {
  id: ProductId;
  slug: string;
  name: string;
  category: ProductCategory;
  brand: ProductBrand; // "FUTBOL" or "TRAINING"
  team: string;
  badge: ProductBadge;
  personalizable: boolean;
  description: string;
  price: Price;
  brandCompany: Brand; // The company brand (LR7)
  images: ProductImage[];
  hoverImage: ProductImage;
  variants: ProductVariant[];
  customization?: CustomizationSettings;
};

export type Category = {
  name: ProductCategory;
  slug: string;
  count: number;
  description: string;
  image: ProductImage;
  parentBrand?: ProductBrand; // "FUTBOL" or "TRAINING"
};
