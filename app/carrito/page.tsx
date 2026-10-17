"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { WhatsAppLink } from "@/components/commerce/whatsapp-link";
import { CheckoutPanel } from "@/components/commerce/checkout-panel";
import { type CartItem, useStore } from "@/components/providers/store-provider";
import { CUSTOM_PRICE, formatCurrency, PRODUCTS } from "@/lib/products";
import { isWhatsAppConfigured } from "@/lib/site";
import { getCartWhatsAppMessage } from "@/lib/whatsapp";

function getItemUnitPrice(item: CartItem) {
  if (item.unitPrice !== undefined) return item.unitPrice;
  let customizationPrice = 0;
  if (item.customization?.enabled) {
    customizationPrice = item.customization.price;
  } else if (item.customName || item.customNumber) {
    customizationPrice = CUSTOM_PRICE;
  }
  return item.product.price.amount + customizationPrice;
}

function hasCartVariant(item: CartItem) {
  return item.product.variants.some((variant) => {
    if (item.variant?.sku) return variant.sku === item.variant.sku;
    return variant.size === item.size && (!item.variant?.color || variant.color === item.variant.color);
  });
}

export default function CartPage() {
  const { cart, hydrated, addToCart, removeFromCart, updateQty, clearCart } = useStore();
  const [removedItem, setRemovedItem] = useState<CartItem | null>(null);
  const currentCart = cart.map((item) => ({
    ...item,
    product: PRODUCTS.find((product) => product.id === item.product.id) ?? item.product,
  }));
  const itemCount = currentCart.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = currentCart.reduce(
    (sum, item) => sum + getItemUnitPrice(item) * item.quantity,
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
          <section className="cart-empty" aria-labelledby="empty-cart-title">
            <div className="cart-empty-mark" aria-hidden="true">07</div>
            <p className="cart-eyebrow">TU SELECCIÓN</p>
            <h1 id="empty-cart-title" className="font-display">TU CARRITO ESTÁ VACÍO.</h1>
            <p>Explora camisetas de fútbol y training seleccionadas por LR7.</p>
            <Link href="/tienda" className="cart-primary-link">VER CAMISETAS <span aria-hidden="true">→</span></Link>
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
          <div>
            <p className="cart-eyebrow">LISTO PARA EL SIGUIENTE PASO</p>
            <h1 className="font-display">TU CARRITO</h1>
          </div>
          <p>{itemCount} {itemCount === 1 ? "PRODUCTO" : "PRODUCTOS"}</p>
        </header>

        {removedItem ? (
          <output className="cart-undo">
            <span>{removedItem.product.name} fue eliminado.</span>
            <button type="button" onClick={restoreItem}>DESHACER</button>
          </output>
        ) : null}

        <div className="cart-layout">
          <section className="cart-products" aria-labelledby="cart-products-title">
            <div className="cart-products-toolbar">
              <h2 id="cart-products-title">PRODUCTOS</h2>
              <button type="button" onClick={clearCart}>VACIAR CARRITO</button>
            </div>

            <ul className="cart-product-list">
              {currentCart.map((item, index) => {
                const itemPrice = getItemUnitPrice(item);
                const variantExists = hasCartVariant(item);

                return (
                  <li key={`${item.product.id}-${item.variant?.sku ?? item.size}-${item.variant?.color ?? ""}-${item.customName}-${item.customNumber}`}>
                    <article className="cart-product-card">
                      <Link href={`/productos/${item.product.slug}`} className="cart-product-image" aria-label={`Ver ${item.product.name}`}>
                        <Image
                          src={item.product.images[0].src}
                          alt={item.product.images[0].alt}
                          fill
                          sizes="(max-width: 600px) 34vw, (max-width: 1000px) 180px, 220px"
                          loading={index === 0 ? "eager" : "lazy"}
                        />
                      </Link>
                      <div className="cart-product-info">
                        <div className="cart-product-heading">
                          <div>
                            <p className="cart-product-category">{item.product.brand} · {item.product.team}</p>
                            <h3 className="font-display">
                              <Link href={`/productos/${item.product.slug}`}>{item.product.name}</Link>
                            </h3>
                          </div>
                          <p className="cart-product-price">${formatCurrency(itemPrice * item.quantity)}</p>
                        </div>

                        <dl className="cart-product-meta">
                          <div><dt>TALLA</dt><dd>{item.size}</dd></div>
                          {item.variant?.color ? <div><dt>COLOR</dt><dd>{item.variant.color}</dd></div> : null}
                          {item.customName ? <div><dt>NOMBRE</dt><dd>{item.customName}</dd></div> : null}
                          {item.customNumber ? <div><dt>NÚMERO</dt><dd>#{item.customNumber}</dd></div> : null}
                          {item.customization?.enabled ? <div><dt>POSICIÓN</dt><dd>ESPALDA</dd></div> : null}
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
                            ELIMINAR
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

            <Link href="/tienda" className="cart-continue-shopping">SEGUIR COMPRANDO</Link>

            <div className="cart-trust" aria-label="Información de compra">
              <Link href="/envios"><strong>ENVÍOS A COLOMBIA</strong><span>Cobertura nacional</span></Link>
              <Link href="/cambios-y-devoluciones"><strong>CAMBIOS</strong><span>Consulta las condiciones</span></Link>
              <Link href="/contacto"><strong>ATENCIÓN LR7</strong><span>Estamos para ayudarte</span></Link>
            </div>

            {isWhatsAppConfigured() ? (
              <div className="cart-whatsapp-support">
                <p>¿TIENES DUDAS SOBRE TU PEDIDO?</p>
                <WhatsAppLink
                  message={whatsappMessage}
                  eventName="cart_whatsapp_click"
                  eventData={{ item_count: itemCount, total: subtotal }}
                  aria-label="Hablar con LR7 por WhatsApp sobre el carrito"
                >
                  HABLA CON LR7 POR WHATSAPP <span aria-hidden="true">→</span>
                </WhatsAppLink>
              </div>
            ) : null}
          </aside>
        </div>

        <div className="cart-mobile-checkout" aria-label="Resumen y pago">
          <div><span>TOTAL</span><strong>${formatCurrency(subtotal)}</strong></div>
          <button type="button" disabled={hasInvalidVariant} onClick={() => document.querySelector<HTMLElement>(".checkout-panel:not([hidden])")?.scrollIntoView({ behavior: "smooth", block: "center" })}>
            CONTINUAR AL PAGO <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function CartProgress() {
  return (
    <ol className="cart-progress" aria-label="Progreso de compra">
      <li aria-current="step">CARRITO</li>
      <li>DATOS</li>
      <li>PAGO</li>
      <li>CONFIRMACIÓN</li>
    </ol>
  );
}
