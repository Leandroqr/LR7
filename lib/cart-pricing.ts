// Precio por unidad de una línea del carrito, compartido por /carrito y el mini-carrito para que
// muestren lo mismo. Es solo informativo: el precio final lo recalcula el servidor en el checkout.
// Sin dependencias para poder probarlo con node --test; quien llama pasa CUSTOM_PRICE (lib/products.ts).
type PricedCartLine = Readonly<{
  product: Readonly<{ price: Readonly<{ amount: number }> }>;
  unitPrice?: number;
  customization?: Readonly<{ enabled: boolean; price: number }>;
  customName?: string;
  customNumber?: string;
  quantity: number;
}>;

/** `legacyCustomPrice` se aplica a líneas antiguas con nombre/número pero sin `customization`. */
export function getItemUnitPrice(item: PricedCartLine, legacyCustomPrice: number) {
  if (item.unitPrice !== undefined) return item.unitPrice;
  let customizationPrice = 0;
  if (item.customization?.enabled) {
    customizationPrice = item.customization.price;
  } else if (item.customName || item.customNumber) {
    customizationPrice = legacyCustomPrice;
  }
  return item.product.price.amount + customizationPrice;
}

export function getCartSubtotal(items: readonly PricedCartLine[], legacyCustomPrice: number) {
  return items.reduce((sum, item) => sum + getItemUnitPrice(item, legacyCustomPrice) * item.quantity, 0);
}
