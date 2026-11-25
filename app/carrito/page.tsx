"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { WhatsAppLink } from "@/components/commerce/whatsapp-link";
import { CheckoutPanel } from "@/components/commerce/checkout-panel";
import { useSiteScope } from "@/components/providers/site-scope-context";
import { legalHref } from "@/lib/legal-pages";
import { type CartItem, useStore } from "@/components/providers/store-provider";
import { getItemUnitPrice } from "@/lib/cart-pricing";
import { CUSTOM_PRICE, formatCurrency, getCategoryDisplayName, PRODUCTS } from "@/lib/products";
import { ProductVisual } from "@/components/product/product-visual";
import { isWhatsAppConfigured } from "@/lib/site";
import { getCartWhatsAppMessage } from "@/lib/whatsapp";


function hasCartVariant(item: CartItem) {
  return item.product.variants.some((variant) => {
    if (item.variant?.sku) return variant.sku === item.variant.sku;
    return variant.size === item.size && (!item.variant?.color || variant.color === item.variant.color);
  });
}

export default function CartPage() {
  const { cart, hydrated, addToCart, removeFromCart, updateQty, clearCart } = useStore();
  const [removedItem, setRemovedItem] = useState<CartItem | null>(null);
  const { legalPages } = useSiteScope();
  const currentCart = cart.map((item) => ({
    ...item,
    product: PRODUCTS.find((product) => product.id === item.product.id) ?? item.product,
  }));
  const itemCount = currentCart.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = currentCart.reduce(
    (sum, item) => sum + getItemUnitPrice(item, CUSTOM_PRICE) * item.quantity,
    0,
  );
  const hasInvalidVariant = currentCart.some((item) => !hasCartVariant(item));

  useEffect(() => {
    document.body.classList.add("cart-route");
    return () => document.body.classList.remove("cart-route");
  }, []);

  useEffect(() => {
    if (!removedItem) return;
    const timeout = window.setTimeout(() => setRemovedItem(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [removedItem]);

  const whatsappMessage = getCartWhatsAppMessage(currentCart, `$${formatCurrency(subtotal)}`);

  const removeItem = (index: number) => {
    setRemovedItem(cart[index]);
    removeFromCart(index);
  };

  const restoreItem = () => {
    if (!removedItem) return;
    addToCart(removedItem);
    setRemovedItem(null);
  };

  // También con el carrito vacío: si se elimina la única línea, el aviso sigue ahí para deshacerlo.
  const undoNotice = removedItem ? (
    <output className="cart-undo">
      <span>{removedItem.product.name} fue eliminado.</span>
      <button type="button" onClick={restoreItem}>Deshacer</button>
    </output>
  ) : null;

  if (!hydrated) {
    return (
      <div className="cart-page cart-loading" aria-busy="true" aria-label="Cargando carrito">
        <div className="cart-container">
          <div className="cart-loading-title" />
          <div className="cart-loading-grid">
            <div className="cart-loading-panel" />
            <div className="cart-loading-summary" />
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <CartProgress />
          {undoNotice}
          <section className="cart-empty" aria-labelledby="empty-cart-title">
            <h1 id="empty-cart-title" className="font-display">Tu carrito está vacío</h1>
            <p>Elige una camiseta en la tienda; si es personalizable, ponle tu nombre y tu número.</p>
            <Link href="/tienda" className="btn-primary cart-primary-link">VER LA TIENDA</Link>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <CartProgress />
        <header className="cart-page-header">
          <h1 className="font-display">Tu carrito</h1>
          <p>{itemCount} {itemCount === 1 ? "producto" : "productos"}</p>
        </header>

        {undoNotice}

        <div className="cart-layout">
          <section className="cart-products" aria-labelledby="cart-products-title">
            <div className="cart-products-toolbar">
              <h2 id="cart-products-title">Productos</h2>
              <button type="button" onClick={clearCart}>Vaciar carrito</button>
            </div>

            <ul className="cart-product-list">
              {currentCart.map((item, index) => {
                const itemPrice = getItemUnitPrice(item, CUSTOM_PRICE);
                const variantExists = hasCartVariant(item);

                return (
                  <li key={`${item.product.id}-${item.variant?.sku ?? item.size}-${item.variant?.color ?? ""}-${item.customName}-${item.customNumber}`}>
                    <article className="cart-product-card">
                      <Link href={`/productos/${item.product.slug}`} className="cart-product-image" aria-label={`Ver ${item.product.name}`}>
                        <ProductVisual
                          product={item.product}
                          sizes="(max-width: 600px) 34vw, (max-width: 1000px) 150px, 180px"
                          loading={index === 0 ? "eager" : "lazy"}
                          className="cart-line-visual"
                          dorsal={{ name: item.customName, number: item.customNumber }}
                        />
                      </Link>
                      <div className="cart-product-info">
                        <div className="cart-product-heading">
                          <div>
                            <p className="cart-product-category">{getCategoryDisplayName(item.product.category)}</p>
                            <h3 className="font-display">
                              <Link href={`/productos/${item.product.slug}`}>{item.product.name}</Link>
                            </h3>
                          </div>
                          <p className="cart-product-price">${formatCurrency(itemPrice * item.quantity)}</p>
                        </div>

                        <dl className="cart-product-meta">
                          <div><dt>Talla</dt><dd>{item.size}</dd></div>
                          {item.variant?.color ? <div><dt>Color</dt><dd>{item.variant.color}</dd></div> : null}
                          {item.customName ? <div><dt>Nombre</dt><dd>{item.customName}</dd></div> : null}
                          {item.customNumber ? <div><dt>Número</dt><dd>{item.customNumber}</dd></div> : null}
                          {item.customization?.enabled ? <div><dt>Posición</dt><dd>Espalda</dd></div> : null}
                        </dl>

                        {!variantExists ? <p className="cart-product-alert" role="alert">Esta talla ya no está disponible.</p> : null}

                        <div className="cart-product-actions">
                          <fieldset className="cart-quantity">
                            <legend className="cart-visually-hidden">Cantidad de {item.product.name}</legend>
                            <button type="button" onClick={() => updateQty(index, item.quantity - 1)} aria-label={`Reducir cantidad de ${item.product.name}`}>−</button>
                            <output key={item.quantity} aria-live="polite">{item.quantity}</output>
                            <button type="button" onClick={() => updateQty(index, item.quantity + 1)} aria-label={`Aumentar cantidad de ${item.product.name}`}>+</button>
                          </fieldset>
                          <button type="button" className="cart-remove" onClick={() => removeItem(index)} aria-label={`Eliminar ${item.product.name} del carrito`}>
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          </section>

          <aside className="cart-summary" aria-labelledby="cart-summary-title">
            <h2 id="cart-summary-title" className="font-display">RESUMEN DEL PEDIDO</h2>
            <div className="cart-summary-lines">
              <div><span>Subtotal</span><strong>${formatCurrency(subtotal)}</strong></div>
              <div><span>Envío</span><strong>Calculado al finalizar</strong></div>
            </div>
            <div className="cart-summary-total">
              <span>TOTAL</span>
              <strong>${formatCurrency(subtotal)}</strong>
            </div>

            {hasInvalidVariant
              ? <p className="cart-checkout-status" role="alert">Revisa la disponibilidad de tus productos antes de continuar.</p>
              : <CheckoutPanel cart={currentCart} />}

            <Link href="/tienda" className="cart-continue-shopping">Seguir comprando</Link>

            <div className="cart-trust" aria-label="Información de compra">
              <Link href="/envios"><strong>Envíos a toda Colombia</strong><span>Cobertura nacional</span></Link>
              <Link href="/cambios-y-devoluciones"><strong>Cambios</strong><span>Consulta las condiciones</span></Link>
              <Link href="/contacto"><strong>Atención LR7</strong><span>Escríbenos</span></Link>
            </div>

            {/* Condiciones de compra antes de pagar (Ley 1480): solo documentos con texto publicado en el CMS. */}
            {legalPages.length ? (
              <nav aria-label="Condiciones de compra" className="mt-1">
                <ul className="m-0 flex list-none flex-wrap gap-x-4 p-0">
                  {legalPages.filter((page) => page.slug !== "aviso-de-privacidad").map((page) => (
                    <li key={page.slug}>
                      <Link href={legalHref(page)} className="inline-flex min-h-11 items-center text-body-sm text-gray-600 underline underline-offset-3 hover:text-night">{page.label}</Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ) : null}

            {isWhatsAppConfigured() ? (
              <div className="cart-whatsapp-support">
                <p>¿Tienes dudas sobre tu pedido?</p>
                <WhatsAppLink
                  message={whatsappMessage}
                  eventName="cart_whatsapp_click"
                  eventData={{ item_count: itemCount, total: subtotal }}
                  aria-label="Hablar con LR7 por WhatsApp sobre el carrito"
                >
                  HABLA CON LR7 POR WHATSAPP
                </WhatsAppLink>
              </div>
            ) : null}
          </aside>
        </div>

        <div className="cart-mobile-checkout" aria-label="Resumen y pago">
          <div><span>TOTAL</span><strong>${formatCurrency(subtotal)}</strong></div>
          <button type="button" disabled={hasInvalidVariant} onClick={() => document.querySelector<HTMLElement>(".checkout-panel:not([hidden])")?.scrollIntoView({ behavior: "smooth", block: "center" })}>
            CONTINUAR AL PAGO
          </button>
        </div>
      </div>
    </div>
  );
}

function CartProgress() {
  return (
    <ol className="cart-progress" aria-label="Progreso de compra">
      <li aria-current="step">Carrito</li>
      <li>Datos</li>
      <li>Pago</li>
      <li>Confirmación</li>
    </ol>
  );
}
