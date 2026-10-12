export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "CUSTOMER" | "ADMIN";
export type OrderStatus =
  | "pending"
  | "payment_pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";
export type PaymentProvider = "mercadopago" | "wompi" | "addi";
export type PaymentStatus = "pending" | "approved" | "rejected" | "cancelled" | "refunded";

type Table<Row, Insert, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

type Timestamped = {
  created_at: string;
  updated_at: string;
};

export type ProductRow = Timestamped & {
  id: string;
  legacy_id: number | null;
  slug: string;
  name: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  currency: string;
  brand: string;
  team: string | null;
  badge: string | null;
  personalizable: boolean;
  featured: boolean;
  active: boolean;
};

export type CategoryRow = Timestamped & {
  id: string;
  parent_id: string | null;
  slug: string;
  name: string;
  description: string | null;
  image_path: string | null;
  sort_order: number;
  active: boolean;
};

export type VariantRow = Timestamped & {
  id: string;
  product_id: string;
  sku: string;
  size: string;
  color: string | null;
  price_override: number | null;
  active: boolean;
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<
        Timestamped & { id: string; role: UserRole; full_name: string | null; phone: string | null },
        { id: string; role?: UserRole; full_name?: string | null; phone?: string | null; created_at?: string; updated_at?: string }
      >;
      products: Table<
        ProductRow,
        {
          id?: string;
          legacy_id?: number | null;
          slug: string;
          name: string;
          description?: string;
          price: number;
          compare_at_price?: number | null;
          currency?: string;
          brand: string;
          team?: string | null;
          badge?: string | null;
          personalizable?: boolean;
          featured?: boolean;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        }
      >;
      product_images: Table<
        { id: string; product_id: string; storage_path: string; alt_text: string; sort_order: number; is_hover: boolean; created_at: string },
        { id?: string; product_id: string; storage_path: string; alt_text: string; sort_order?: number; is_hover?: boolean; created_at?: string }
      >;
      product_variants: Table<
        VariantRow,
        { id?: string; product_id: string; sku: string; size: string; color?: string | null; price_override?: number | null; active?: boolean; created_at?: string; updated_at?: string }
      >;
      categories: Table<
        CategoryRow,
        { id?: string; parent_id?: string | null; slug: string; name: string; description?: string | null; image_path?: string | null; sort_order?: number; active?: boolean; created_at?: string; updated_at?: string }
      >;
      product_categories: Table<
        { product_id: string; category_id: string; is_primary: boolean },
        { product_id: string; category_id: string; is_primary?: boolean }
      >;
      inventory: Table<
        { variant_id: string; stock: number; low_stock_threshold: number; updated_at: string },
        { variant_id: string; stock?: number; low_stock_threshold?: number; updated_at?: string }
      >;
      orders: Table<
        Timestamped & {
          id: string;
          order_number: string;
          user_id: string | null;
          status: OrderStatus;
          subtotal: number;
          shipping: number;
          discount: number;
          total: number;
          currency: string;
          customer_email: string;
          customer_name: string;
          customer_phone: string | null;
          shipping_information: Json;
        },
        {
          id?: string;
          order_number?: string;
          user_id?: string | null;
          status?: OrderStatus;
          subtotal: number;
          shipping?: number;
          discount?: number;
          total: number;
          currency?: string;
          customer_email: string;
          customer_name: string;
          customer_phone?: string | null;
          shipping_information: Json;
          created_at?: string;
          updated_at?: string;
        }
      >;
      order_items: Table<
        { id: string; order_id: string; product_id: string | null; variant_id: string | null; product_name: string; sku: string; size: string | null; color: string | null; quantity: number; unit_price: number; personalization: Json; line_total: number; created_at: string },
        { id?: string; order_id: string; product_id?: string | null; variant_id?: string | null; product_name: string; sku: string; size?: string | null; color?: string | null; quantity: number; unit_price: number; personalization?: Json; line_total: number; created_at?: string }
      >;
      payments: Table<
        Timestamped & { id: string; order_id: string; provider: PaymentProvider; transaction_id: string | null; status: PaymentStatus; amount: number; currency: string; metadata: Json },
        { id?: string; order_id: string; provider: PaymentProvider; transaction_id?: string | null; status?: PaymentStatus; amount: number; currency?: string; metadata?: Json; created_at?: string; updated_at?: string }
      >;
      coupons: Table<
        Timestamped & { id: string; code: string; discount_type: "percent" | "fixed"; discount_value: number; minimum_order: number; maximum_discount: number | null; usage_limit: number | null; usage_count: number; starts_at: string | null; ends_at: string | null; active: boolean },
        { id?: string; code: string; discount_type: "percent" | "fixed"; discount_value: number; minimum_order?: number; maximum_discount?: number | null; usage_limit?: number | null; usage_count?: number; starts_at?: string | null; ends_at?: string | null; active?: boolean; created_at?: string; updated_at?: string }
      >;
      home_slides: Table<
        Timestamped & { id: string; image_path: string; eyebrow: string; title: string; accent_text: string | null; subtitle: string | null; cta_label: string; cta_href: string; sort_order: number; active: boolean },
        { id?: string; image_path: string; eyebrow: string; title: string; accent_text?: string | null; subtitle?: string | null; cta_label: string; cta_href: string; sort_order?: number; active?: boolean; created_at?: string; updated_at?: string }
      >;
      home_sections: Table<
        Timestamped & { id: string; section_key: string; section_type: string; title: string; eyebrow: string | null; subtitle: string | null; cta_label: string | null; cta_href: string | null; configuration: Json; sort_order: number; active: boolean },
        { id?: string; section_key: string; section_type: string; title: string; eyebrow?: string | null; subtitle?: string | null; cta_label?: string | null; cta_href?: string | null; configuration?: Json; sort_order?: number; active?: boolean; created_at?: string; updated_at?: string }
      >;
      navigation_items: Table<
        Timestamped & { id: string; parent_id: string | null; location: "header" | "footer"; label: string; href: string; sort_order: number; active: boolean },
        { id?: string; parent_id?: string | null; location: "header" | "footer"; label: string; href: string; sort_order?: number; active?: boolean; created_at?: string; updated_at?: string }
      >;
      newsletter_subscribers: Table<
        Timestamped & { id: string; email: string; status: "pending" | "active" | "unsubscribed"; consent_at: string; consent_source: string; confirmed_at: string | null; unsubscribed_at: string | null },
        { id?: string; email: string; status?: "pending" | "active" | "unsubscribed"; consent_at?: string; consent_source: string; confirmed_at?: string | null; unsubscribed_at?: string | null; created_at?: string; updated_at?: string }
      >;
      content_items: Table<
        Timestamped & { id: string; page_key: string; content_key: string; title: string; eyebrow: string | null; body: string | null; image_path: string | null; cta_label: string | null; cta_href: string | null; configuration: Json; sort_order: number; active: boolean },
        { id?: string; page_key: string; content_key: string; title?: string; eyebrow?: string | null; body?: string | null; image_path?: string | null; cta_label?: string | null; cta_href?: string | null; configuration?: Json; sort_order?: number; active?: boolean; created_at?: string; updated_at?: string }
      >;
      site_settings: Table<
        { id: string; setting_key: string; value: Json; active: boolean; updated_at: string },
        { id?: string; setting_key: string; value: Json; active?: boolean; updated_at?: string }
      >;
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: never; Returns: boolean };
      set_user_role: { Args: { target_user_id: string; new_role: UserRole }; Returns: undefined };
    };
    Enums: {
      user_role: UserRole;
      order_status: OrderStatus;
      payment_provider: PaymentProvider;
      payment_status: PaymentStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
