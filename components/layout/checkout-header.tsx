import Link from "next/link";

export function CheckoutHeader() {
  return (
    <header className="checkout-site-header">
      <div className="checkout-site-header-inner">
        <Link href="/tienda" className="checkout-back-link" aria-label="Volver a la tienda">
          <span aria-hidden="true">←</span>
          <span>SEGUIR COMPRANDO</span>
        </Link>
        <Link href="/" className="checkout-brand" aria-label="LR7, ir al inicio">
          LR<span>7</span>
        </Link>
        <span className="checkout-header-label">CARRITO</span>
      </div>
    </header>
  );
}