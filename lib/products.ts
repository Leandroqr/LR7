import type { Category, Product, ProductCategory } from "@/types/ecommerce";

const brandCompany = { name: "LR7" };

export const CUSTOM_PRICE = 15000;

export const PRODUCTS: Product[] = [
  // FUTBOL - FOOTBALL CATEGORY
  {
    id: 1,
    slug: "seleccion-colombia",
    name: "Seleccion Colombia",
    category: "FUTBOL_SELECCIONES",
    brand: "FUTBOL",
    team: "Colombia",
    badge: "MAS VENDIDA",
    personalizable: true,
    description:
      "La camiseta mas iconica del futbol colombiano. Tela ligera de alto rendimiento con diseno exclusivo y corte atletico premium. Perfecta para la cancha y la calle.",
    price: { amount: 89000, currency: "COP" },
    brandCompany,
    images: [
      { src: "https://images.unsplash.com/photo-1616124619460-ff4ed8f4683c?w=900&h=1100&fit=crop&auto=format", alt: "Camiseta Seleccion Colombia vista principal" },
      { src: "https://images.unsplash.com/photo-1577212017184-80cc0da11082?w=900&h=1100&fit=crop&auto=format", alt: "Camiseta Seleccion Colombia detalle" },
      { src: "https://images.unsplash.com/photo-1671680134709-4978c22fb916?w=900&h=1100&fit=crop&auto=format", alt: "Camiseta Seleccion Colombia lookbook" },
      { src: "https://images.unsplash.com/photo-1759808944777-a05e2e9d0685?w=900&h=1100&fit=crop&auto=format", alt: "Camiseta Seleccion Colombia lifestyle" },
    ],
    hoverImage: {
      src: "https://images.unsplash.com/photo-1577212017184-80cc0da11082?w=600&h=800&fit=crop&auto=format",
      alt: "Camiseta Seleccion Colombia vista alternativa",
    },
    variants: [{ size: "S" }, { size: "M" }, { size: "L" }, { size: "XL" }, { size: "XXL" }],
  },
  {
    id: 2,
    slug: "clasico-europeo",
    name: "Clasico Europeo",
    category: "FUTBOL_CLUBES",
    brand: "FUTBOL",
    team: "Real Madrid",
    badge: "NUEVO",
    personalizable: true,
    description:
      "La elegancia del futbol europeo llevada a una camiseta de coleccion. Diseno refinado, tela de alta tecnologia y acabados premium en cada detalle.",
    price: { amount: 95000, currency: "COP" },
    brandCompany,
    images: [
      { src: "https://images.unsplash.com/photo-1552066379-e7bfd22155c5?w=900&h=1100&fit=crop&auto=format", alt: "Clasico Europeo frontal" },
      { src: "https://images.unsplash.com/photo-1563382563268-23859556c3f2?w=900&h=1100&fit=crop&auto=format", alt: "Clasico Europeo detalle" },
      { src: "https://images.unsplash.com/photo-1599204606471-32a75bc663e9?w=900&h=1100&fit=crop&auto=format", alt: "Clasico Europeo lifestyle" },
    ],
    hoverImage: {
      src: "https://images.unsplash.com/photo-1563382563268-23859556c3f2?w=600&h=800&fit=crop&auto=format",
      alt: "Clasico Europeo vista alternativa",
    },
    variants: [{ size: "S" }, { size: "M" }, { size: "L" }, { size: "XL" }, { size: "XXL" }],
  },
  {
    id: 4,
    slug: "vintage-brasil-82",
    name: "Vintage Brasil 82",
    category: "FUTBOL_RETRO",
    brand: "FUTBOL",
    team: "Brasil",
    badge: "LIMITADA",
    personalizable: true,
    description:
      "Un homenaje al Brasil del 82, el equipo mas bello de la historia. Edicion de coleccion con detalles retro autenticos y calidad contemporanea.",
    price: { amount: 85000, currency: "COP" },
    brandCompany,
    images: [
      { src: "https://images.unsplash.com/photo-1516948900-c5137d2bf399?w=900&h=1100&fit=crop&auto=format", alt: "Vintage Brasil 82 principal" },
      { src: "https://images.unsplash.com/photo-1662096909714-e2f206d0a636?w=900&h=1100&fit=crop&auto=format", alt: "Vintage Brasil 82 detalle" },
    ],
    hoverImage: {
      src: "https://images.unsplash.com/photo-1662096909714-e2f206d0a636?w=600&h=800&fit=crop&auto=format",
      alt: "Vintage Brasil 82 hover",
    },
    variants: [{ size: "S" }, { size: "M" }, { size: "L" }, { size: "XL" }],
  },
  {
    id: 5,
    slug: "argentina-78",
    name: "Argentina 78",
    category: "FUTBOL_RETRO",
    brand: "FUTBOL",
    team: "Argentina",
    badge: "LIMITADA",
    personalizable: true,
    description:
      "La historia del primer mundial argentino en una camiseta de edicion limitada. Diseno vintage que evoca la magia de un torneo legendario.",
    price: { amount: 89000, currency: "COP" },
    brandCompany,
    images: [
      { src: "https://images.unsplash.com/photo-1671680134709-4978c22fb916?w=900&h=1100&fit=crop&auto=format", alt: "Argentina 78 principal" },
      { src: "https://images.unsplash.com/photo-1621372361778-dbf5a16c8a6d?w=900&h=1100&fit=crop&auto=format", alt: "Argentina 78 detalle" },
    ],
    hoverImage: {
      src: "https://images.unsplash.com/photo-1621372361778-dbf5a16c8a6d?w=600&h=800&fit=crop&auto=format",
      alt: "Argentina 78 hover",
    },
    variants: [{ size: "S" }, { size: "M" }, { size: "L" }, { size: "XL" }],
  },
  {
    id: 6,
    slug: "nacional-2024",
    name: "Nacional 2024",
    category: "FUTBOL_CLUBES",
    brand: "FUTBOL",
    team: "Atletico Nacional",
    badge: "NUEVO",
    personalizable: true,
    description:
      "El orgullo verdolaga en su edicion 2024. Para los que llevan el verde en el corazon, una camiseta que representa la historia del club mas grande de Colombia.",
    price: { amount: 79000, currency: "COP" },
    brandCompany,
    images: [
      { src: "https://images.unsplash.com/photo-1759808944777-a05e2e9d0685?w=900&h=1100&fit=crop&auto=format", alt: "Nacional 2024 principal" },
      { src: "https://images.unsplash.com/photo-1745944756454-938dcb6e62ea?w=900&h=1100&fit=crop&auto=format", alt: "Nacional 2024 detalle" },
    ],
    hoverImage: {
      src: "https://images.unsplash.com/photo-1745944756454-938dcb6e62ea?w=600&h=800&fit=crop&auto=format",
      alt: "Nacional 2024 hover",
    },
    variants: [{ size: "S" }, { size: "M" }, { size: "L" }, { size: "XL" }, { size: "XXL" }],
  },
  {
    id: 7,
    slug: "milan-clasico",
    name: "Milan Clasico",
    category: "FUTBOL_CLUBES",
    brand: "FUTBOL",
    team: "AC Milan",
    badge: null,
    personalizable: true,
    description:
      "El rojo y negro del Diavolo en una camiseta que respira historia italiana. Coleccion premium para los amantes del Calcio y el estilo europeo.",
    price: { amount: 92000, currency: "COP" },
    brandCompany,
    images: [
      { src: "https://images.unsplash.com/photo-1757876804347-b62e5bd391e6?w=900&h=1100&fit=crop&auto=format", alt: "Milan Clasico principal" },
      { src: "https://images.unsplash.com/photo-1616124619460-ff4ed8f4683c?w=900&h=1100&fit=crop&auto=format", alt: "Milan Clasico detalle" },
    ],
    hoverImage: {
      src: "https://images.unsplash.com/photo-1616124619460-ff4ed8f4683c?w=600&h=800&fit=crop&auto=format",
      alt: "Milan Clasico hover",
    },
    variants: [{ size: "S" }, { size: "M" }, { size: "L" }, { size: "XL" }, { size: "XXL" }],
  },
  {
    id: 8,
    slug: "seleccion-brasil",
    name: "Seleccion Brasil",
    category: "FUTBOL_SELECCIONES",
    brand: "FUTBOL",
    team: "Brasil",
    badge: null,
    personalizable: true,
    description:
      "El amarillo canario que domina el mundo. La camiseta de la seleccion mas exitosa del futbol mundial, ahora en tu guardarropa con calidad premium.",
    price: { amount: 89000, currency: "COP" },
    brandCompany,
    images: [
      { src: "https://images.unsplash.com/photo-1563382563268-23859556c3f2?w=900&h=1100&fit=crop&auto=format", alt: "Seleccion Brasil principal" },
      { src: "https://images.unsplash.com/photo-1552066379-e7bfd22155c5?w=900&h=1100&fit=crop&auto=format", alt: "Seleccion Brasil detalle" },
    ],
    hoverImage: {
      src: "https://images.unsplash.com/photo-1552066379-e7bfd22155c5?w=600&h=800&fit=crop&auto=format",
      alt: "Seleccion Brasil hover",
    },
    variants: [{ size: "S" }, { size: "M" }, { size: "L" }, { size: "XL" }, { size: "XXL" }],
  },
  // TRAINING CATEGORY
  {
    id: 9,
    slug: "entrenamiento-pro",
    name: "Entrenamiento Pro",
    category: "TRAINING_CAMISETAS",
    brand: "TRAINING",
    team: "Generica",
    badge: null,
    personalizable: false,
    description:
      "Camiseta deportiva disenada para el rendimiento maximo en entrenamientos. Tejido tecnico transpirable que mantiene la frescura en sesiones intensas de alto nivel.",
    price: { amount: 75000, currency: "COP" },
    brandCompany,
    images: [
      { src: "https://images.unsplash.com/photo-1599204606471-32a75bc663e9?w=900&h=1100&fit=crop&auto=format", alt: "Entrenamiento Pro principal" },
      { src: "https://images.unsplash.com/photo-1608211070124-c747f619754f?w=900&h=1100&fit=crop&auto=format", alt: "Entrenamiento Pro alternativa" },
    ],
    hoverImage: {
      src: "https://images.unsplash.com/photo-1608211070124-c747f619754f?w=600&h=800&fit=crop&auto=format",
      alt: "Entrenamiento Pro hover",
    },
    variants: [{ size: "S" }, { size: "M" }, { size: "L" }, { size: "XL" }, { size: "XXL" }],
  },
  {
    id: 10,
    slug: "camisilla-training-premium",
    name: "Camisilla Training Premium",
    category: "TRAINING_CAMISILLAS",
    brand: "TRAINING",
    team: "Generica",
    badge: "NUEVO",
    personalizable: false,
    description:
      "Camisilla sin mangas para entrenamientos intensos y actividades deportivas. Material transpirable y ajuste perfecto para maxima libertad de movimiento.",
    price: { amount: 65000, currency: "COP" },
    brandCompany,
    images: [
      { src: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&h=1100&fit=crop&auto=format", alt: "Camisilla Training Premium principal" },
      { src: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=900&h=1100&fit=crop&auto=format", alt: "Camisilla Training Premium alternativa" },
    ],
    hoverImage: {
      src: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=800&fit=crop&auto=format",
      alt: "Camisilla Training Premium hover",
    },
    variants: [{ size: "S" }, { size: "M" }, { size: "L" }, { size: "XL" }, { size: "XXL" }],
  },
  {
    id: 11,
    slug: "pantaloneta-training",
    name: "Pantaloneta Training",
    category: "TRAINING_PANTALONETAS",
    brand: "TRAINING",
    team: "Generica",
    badge: null,
    personalizable: false,
    description:
      "Pantaloneta de alto rendimiento para entrenamientos de futbol, gimnasio y actividades deportivas. Tecnologia anti-humedad y secado rapido.",
    price: { amount: 68000, currency: "COP" },
    brandCompany,
    images: [
      { src: "https://images.unsplash.com/photo-1608211070124-c747f619754f?w=900&h=1100&fit=crop&auto=format", alt: "Pantaloneta Training principal" },
      { src: "https://images.unsplash.com/photo-1599204606471-32a75bc663e9?w=900&h=1100&fit=crop&auto=format", alt: "Pantaloneta Training alternativa" },
    ],
    hoverImage: {
      src: "https://images.unsplash.com/photo-1599204606471-32a75bc663e9?w=600&h=800&fit=crop&auto=format",
      alt: "Pantaloneta Training hover",
    },
    variants: [{ size: "S" }, { size: "M" }, { size: "L" }, { size: "XL" }, { size: "XXL" }],
  },
  {
    id: 12,
    slug: "buzo-training",
    name: "Buzo Training",
    category: "TRAINING_BUZOS",
    brand: "TRAINING",
    team: "Generica",
    badge: "NUEVO",
    personalizable: false,
    description:
      "Buzo deportivo perfecto para entrenamientos y actividades al aire libre. Tela suave y abrigada que mantiene el confort sin sacrificar movilidad.",
    price: { amount: 125000, currency: "COP" },
    brandCompany,
    images: [
      { src: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&h=1100&fit=crop&auto=format", alt: "Buzo Training principal" },
      { src: "https://images.unsplash.com/photo-1608211070124-c747f619754f?w=900&h=1100&fit=crop&auto=format", alt: "Buzo Training alternativa" },
    ],
    hoverImage: {
      src: "https://images.unsplash.com/photo-1608211070124-c747f619754f?w=600&h=800&fit=crop&auto=format",
      alt: "Buzo Training hover",
    },
    variants: [{ size: "S" }, { size: "M" }, { size: "L" }, { size: "XL" }, { size: "XXL" }],
  },
  {
    id: 13,
    slug: "conjunto-training-completo",
    name: "Conjunto Training Completo",
    category: "TRAINING_CONJUNTOS",
    brand: "TRAINING",
    team: "Generica",
    badge: null,
    personalizable: false,
    description:
      "Conjunto de entrenamiento compuesto por camiseta y pantaloneta coordinadas. Diseno deportivo con tecnologia de alto rendimiento para maximizar tu entrenamiento.",
    price: { amount: 138000, currency: "COP" },
    brandCompany,
    images: [
      { src: "https://images.unsplash.com/photo-1599204606471-32a75bc663e9?w=900&h=1100&fit=crop&auto=format", alt: "Conjunto Training Completo principal" },
      { src: "https://images.unsplash.com/photo-1608211070124-c747f619754f?w=900&h=1100&fit=crop&auto=format", alt: "Conjunto Training Completo alternativa" },
    ],
    hoverImage: {
      src: "https://images.unsplash.com/photo-1608211070124-c747f619754f?w=600&h=800&fit=crop&auto=format",
      alt: "Conjunto Training Completo hover",
    },
    variants: [{ size: "S" }, { size: "M" }, { size: "L" }, { size: "XL" }, { size: "XXL" }],
  },
];

export const CATEGORIES: Category[] = [
  // FUTBOL MAIN CATEGORY
  {
    name: "FUTBOL",
    slug: "futbol",
    count: 7,
    description: "Camisetas de futbol premium para vivir tu pasion por el juego",
    image: {
      src: "https://images.unsplash.com/photo-1490108474814-221f6198acc5?w=800&h=1100&fit=crop&auto=format",
      alt: "Categoria Futbol",
    },
    parentBrand: "FUTBOL",
  },
  // FUTBOL SUBCATEGORIES
  {
    name: "FUTBOL_CAMISETAS",
    slug: "futbol-camisetas",
    count: 1,
    description: "Camisetas de futbol premium",
    image: {
      src: "https://images.unsplash.com/photo-1490108474814-221f6198acc5?w=800&h=1100&fit=crop&auto=format",
      alt: "Camisetas de Futbol",
    },
    parentBrand: "FUTBOL",
  },
  {
    name: "FUTBOL_SELECCIONES",
    slug: "futbol-selecciones",
    count: 2,
    description: "Lleva tu pais en el pecho",
    image: {
      src: "https://images.unsplash.com/photo-1599204606471-32a75bc663e9?w=800&h=1100&fit=crop&auto=format",
      alt: "Selecciones",
    },
    parentBrand: "FUTBOL",
  },
  {
    name: "FUTBOL_CLUBES",
    slug: "futbol-clubes",
    count: 3,
    description: "Fiel a tus colores",
    image: {
      src: "https://images.unsplash.com/photo-1745944756454-938dcb6e62ea?w=800&h=1100&fit=crop&auto=format",
      alt: "Clubes",
    },
    parentBrand: "FUTBOL",
  },
  {
    name: "FUTBOL_RETRO",
    slug: "futbol-retro",
    count: 2,
    description: "Historia del futbol en tu piel",
    image: {
      src: "https://images.unsplash.com/photo-1516948900-c5137d2bf399?w=800&h=1100&fit=crop&auto=format",
      alt: "Retro",
    },
    parentBrand: "FUTBOL",
  },
  // TRAINING MAIN CATEGORY
  {
    name: "TRAINING",
    slug: "training",
    count: 5,
    description: "Ropa deportiva para entrenamientos y actividad fisica",
    image: {
      src: "https://images.unsplash.com/photo-1608211070124-c747f619754f?w=800&h=1100&fit=crop&auto=format",
      alt: "Categoria Training",
    },
    parentBrand: "TRAINING",
  },
  // TRAINING SUBCATEGORIES
  {
    name: "TRAINING_CAMISETAS",
    slug: "training-camisetas",
    count: 1,
    description: "Camisetas deportivas de alto rendimiento",
    image: {
      src: "https://images.unsplash.com/photo-1599204606471-32a75bc663e9?w=800&h=1100&fit=crop&auto=format",
      alt: "Camisetas Training",
    },
    parentBrand: "TRAINING",
  },
  {
    name: "TRAINING_CAMISILLAS",
    slug: "training-camisillas",
    count: 1,
    description: "Camisillas sin mangas para entrenamiento",
    image: {
      src: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=1100&fit=crop&auto=format",
      alt: "Camisillas Training",
    },
    parentBrand: "TRAINING",
  },
  {
    name: "TRAINING_PANTALONETAS",
    slug: "training-pantalonetas",
    count: 1,
    description: "Pantalonetas de alto rendimiento",
    image: {
      src: "https://images.unsplash.com/photo-1608211070124-c747f619754f?w=800&h=1100&fit=crop&auto=format",
      alt: "Pantalonetas Training",
    },
    parentBrand: "TRAINING",
  },
  {
    name: "TRAINING_BUZOS",
    slug: "training-buzos",
    count: 1,
    description: "Buzos deportivos para entrenamiento",
    image: {
      src: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=1100&fit=crop&auto=format",
      alt: "Buzos Training",
    },
    parentBrand: "TRAINING",
  },
  {
    name: "TRAINING_CONJUNTOS",
    slug: "training-conjuntos",
    count: 1,
    description: "Conjuntos deportivos coordinados",
    image: {
      src: "https://images.unsplash.com/photo-1599204606471-32a75bc663e9?w=800&h=1100&fit=crop&auto=format",
      alt: "Conjuntos Training",
    },
    parentBrand: "TRAINING",
  },
];

export const COLLECTION_CATEGORY_MAP: Record<string, string> = {
  futbol: "FUTBOL",
  "futbol-camisetas": "FUTBOL_CAMISETAS",
  "futbol-selecciones": "FUTBOL_SELECCIONES",
  "futbol-clubes": "FUTBOL_CLUBES",
  "futbol-retro": "FUTBOL_RETRO",
  training: "TRAINING",
  "training-camisetas": "TRAINING_CAMISETAS",
  "training-camisillas": "TRAINING_CAMISILLAS",
  "training-pantalonetas": "TRAINING_PANTALONETAS",
  "training-buzos": "TRAINING_BUZOS",
  "training-conjuntos": "TRAINING_CONJUNTOS",
};

const CATEGORY_DISPLAY_NAMES: Partial<Record<ProductCategory, string>> = {
  FUTBOL: "Fútbol",
  FUTBOL_CAMISETAS: "Camisetas de fútbol",
  FUTBOL_SELECCIONES: "Camisetas de selecciones",
  FUTBOL_CLUBES: "Camisetas de clubes",
  FUTBOL_RETRO: "Camisetas retro",
  TRAINING: "Training",
  TRAINING_CAMISETAS: "Camisetas de training",
  TRAINING_CAMISILLAS: "Camisillas de training",
  TRAINING_PANTALONETAS: "Pantalonetas de training",
  TRAINING_BUZOS: "Buzos de training",
  TRAINING_CONJUNTOS: "Conjuntos de training",
};

export function getCategoryDisplayName(categoryName: ProductCategory) {
  return CATEGORY_DISPLAY_NAMES[categoryName] ?? categoryName.replaceAll("_", " ");
}

export function formatCurrency(amount: number): string {
  return amount.toLocaleString("es-CO");
}

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((product) => product.slug === slug);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((category) => category.slug === slug);
}

export function getProductsByCategorySlug(slug: string, products: Product[] = PRODUCTS): Product[] {
  const categoryName = COLLECTION_CATEGORY_MAP[slug];
  if (!categoryName) {
    return [];
  }
  if (categoryName === "FUTBOL" || categoryName === "FUTBOL_CAMISETAS") {
    return products.filter((product) => product.brand === "FUTBOL");
  }
  if (categoryName === "TRAINING") {
    return products.filter((product) => product.brand === "TRAINING");
  }
  return products.filter((product) => product.category === categoryName);
}
