import Link from "next/link";

export function CheckoutHeader() {
  return (
    <header className="checkout-site-header">
      <div className="checkout-site-header-inner">
        <Link href="/tienda" className="checkout-back-link" aria-label="Volver a la tienda">
          <svg className="checkout-back-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M15 5 8 12l7 7" /></svg>
          <span>Seguir comprando</span>
        </Link>
        <Link href="/" className="checkout-brand" aria-label="LR7, ir al inicio">
          LR<span>7</span>
        </Link>
        <span className="checkout-header-label">Pago con Wompi</span>
      </div>
    </header>
  );
}