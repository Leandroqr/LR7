export type CheckoutCartEntry = Readonly<{
  product: Readonly<{ slug: string }>;
  variant?: Readonly<{ sku?: string }>;
  size: string;
  quantity: number;
  customName?: string;
  customNumber?: string;
  customization?: Readonly<{ enabled: boolean }>;
}>;

export const CHECKOUT_ATTEMPT_STORAGE_KEY = "lr7.checkout.attempt.v1";

export function serializeCheckoutCart(items: readonly CheckoutCartEntry[]) {
  return items.map((item) => ({
    sku: item.variant?.sku?.trim() || `${item.product.slug}-${item.size}`,
    quantity: item.quantity,
    personalization: item.customization?.enabled
      ? { enabled: true, name: item.customName ?? "", number: item.customNumber ?? "" }
      : { enabled: false },
  }));
}
