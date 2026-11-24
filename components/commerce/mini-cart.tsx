"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useStore } from "@/components/providers/store-provider";
import { getCartSubtotal, getItemUnitPrice } from "@/lib/cart-pricing";
import { CUSTOM_PRICE, formatCurrency } from "@/lib/products";
import { ProductVisual } from "@/components/product/product-visual";

const CLOSE_ICON = <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M18 6 6 18M6 6l12 12" /></svg>;

/**
 * Confirmación al agregar al carrito: panel lateral modal con la línea agregada, el subtotal y las
 * dos salidas (seguir comprando / ir al carrito). Se abre solo con `addToCart(item, { notify: true })`.
 */
export function MiniCart() {
  const { cart, cartCount, cartNotice, dismissCartNotice } = useStore();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const primaryActionRef = useRef<HTMLAnchorElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !cartNotice || dialog.open) return;
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog.showModal();
    // React no escribe `autofocus` en el DOM: se enfoca la acción principal tras abrir el modal.
    primaryActionRef.current?.focus();
  }, [cartNotice]);

  // Cambiar de página (por ejemplo con "Ir al carrito") cierra el panel.
  useEffect(() => {
    if (dialogRef.current?.open) dialogRef.current.close();
  }, [pathname]);

  const close = () => dialogRef.current?.close();

  const handleClose = () => {
    dismissCartNotice();
    const target = returnFocusRef.current;
    returnFocusRef.current = null;
    if (target?.isConnected) target.focus({ preventScroll: true });
  };

  const item = cartNotice?.item;
  const details = item
    ? [
        item.size ? `Talla ${item.size}` : "",
        item.variant?.color ?? "",
        item.customName ? `Nombre ${item.customName}` : "",
        item.customNumber ? `Número ${item.customNumber}` : "",
      ].filter(Boolean)
    : [];

  return (
    <dialog
      ref={dialogRef}
      className="mini-cart"
      aria-labelledby="mini-cart-title"
      onClose={handleClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      {item ? (
        <div className="mini-cart-panel">
          <header className="mini-cart-header">
            <h2 id="mini-cart-title" className="font-display">Agregado al carrito</h2>
            <button type="button" className="mini-cart-close" onClick={close} aria-label="Cerrar">{CLOSE_ICON}</button>
          </header>

          <div className="mini-cart-line">
            <div className="mini-cart-image" aria-hidden="true">
              <ProductVisual product={item.product} sizes="88px" className="cart-line-visual" dorsal={{ name: item.customName, number: item.customNumber }} />
            </div>
            <div className="mini-cart-line-copy">
              <strong>{item.product.name}</strong>
              {details.map((detail) => <span key={detail}>{detail}</span>)}
              <span>
                {item.quantity} × ${formatCurrency(getItemUnitPrice(item, CUSTOM_PRICE))}
              </span>
            </div>
          </div>

          <dl className="mini-cart-summary">
            <div>
              <dt>Tu carrito</dt>
              <dd>{cartCount} {cartCount === 1 ? "producto" : "productos"}</dd>
            </div>
            <div>
              <dt>Subtotal</dt>
              <dd className="font-display">${formatCurrency(getCartSubtotal(cart, CUSTOM_PRICE))}</dd>
            </div>
          </dl>
          <p className="mini-cart-note">El envío se calcula al finalizar la compra.</p>

          <div className="mini-cart-actions">
            <Link ref={primaryActionRef} href="/carrito" className="btn-primary">
              IR AL CARRITO
            </Link>
            <button type="button" className="btn-outline" onClick={close}>
              SEGUIR COMPRANDO
            </button>
          </div>
        </div>
      ) : null}
    </dialog>
  );
}
