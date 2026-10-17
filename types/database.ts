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
          checkout_idempotency_key: string | null;
          checkout_payload_hash: string | null;
          public_access_token_hash: string | null;
          reservation_expires_at: string | null;
          fulfillment_status: "unfulfilled" | "processing" | "shipped" | "delivered" | "cancelled";
          fulfillment_hold: boolean;
          fulfillment_hold_reason: string | null;
          coupon_usage_reserved: boolean;
          coupon_redeemed_at: string | null;
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
          checkout_idempotency_key?: string | null;
          checkout_payload_hash?: string | null;
          public_access_token_hash?: string | null;
          reservation_expires_at?: string | null;
          fulfillment_status?: "unfulfilled" | "processing" | "shipped" | "delivered" | "cancelled";
          fulfillment_hold?: boolean;
          fulfillment_hold_reason?: string | null;
          coupon_usage_reserved?: boolean;
          coupon_redeemed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      order_items: Table<
        { id: string; order_id: string; product_id: string | null; variant_id: string | null; product_name: string; sku: string; size: string | null; color: string | null; quantity: number; unit_price: number; personalization: Json; line_total: number; created_at: string },
        { id?: string; order_id: string; product_id?: string | null; variant_id?: string | null; product_name: string; sku: string; size?: string | null; color?: string | null; quantity: number; unit_price: number; personalization?: Json; line_total: number; created_at?: string }
      >;
      payments: Table<
        Timestamped & { id: string; order_id: string; provider: PaymentProvider; transaction_id: string | null; status: PaymentStatus; amount: number; currency: string; metadata: Json; reference: string | null; environment: "sandbox" | "production" | null; attempt_idempotency_key: string | null; last_event_timestamp: number | null },
        { id?: string; order_id: string; provider: PaymentProvider; transaction_id?: string | null; status?: PaymentStatus; amount: number; currency?: string; metadata?: Json; reference?: string | null; environment?: "sandbox" | "production" | null; attempt_idempotency_key?: string | null; last_event_timestamp?: number | null; created_at?: string; updated_at?: string }
      >;
      inventory_reservations: Table<
        { order_id: string; variant_id: string; quantity: number; state: "reserved" | "committed" | "released"; expires_at: string; created_at: string; updated_at: string },
        { order_id: string; variant_id: string; quantity: number; state: "reserved" | "committed" | "released"; expires_at: string; created_at?: string; updated_at?: string }
      >;
      wompi_event_receipts: Table<
        { event_key: string; source: "webhook" | "reconciliation"; payment_reference: string | null; transaction_id: string | null; wompi_status: string | null; event_timestamp: number | null; result: string; received_at: string; processed_at: string | null },
        { event_key: string; source: "webhook" | "reconciliation"; payment_reference?: string | null; transaction_id?: string | null; wompi_status?: string | null; event_timestamp?: number | null; result?: string; received_at?: string; processed_at?: string | null }
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
      start_wompi_checkout: { Args: { p_idempotency_key: string; p_payload_hash: string; p_access_token_hash: string; p_attempt_idempotency_key: string; p_user_id: string | null; p_customer_email: string; p_customer_name: string; p_customer_phone: string; p_shipping_information: Json; p_items: Json; p_coupon_code: string | null; p_environment: string }; Returns: Json };
      apply_wompi_transaction: { Args: { p_event_key: string; p_source: "webhook" | "reconciliation"; p_reference: string; p_transaction_id: string; p_wompi_status: string; p_amount_in_cents: number; p_currency: string; p_environment: string; p_event_timestamp: number }; Returns: Json };
      expire_wompi_checkout_reservations: { Args: { batch_size?: number }; Returns: number };
      expire_wompi_checkout_order: { Args: { target_order_id: string }; Returns: boolean };
      set_order_fulfillment_status: { Args: { target_order_id: string; new_status: string }; Returns: undefined };
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
