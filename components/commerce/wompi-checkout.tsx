"use client";

import Script from "next/script";
import { useState } from "react";

type WompiTransaction = {
  id?: string;
  status?: string;
  reference?: string;
};

type WompiCheckoutProps = Readonly<{
  publicKey: string;
  reference: string;
  amountInCents: number;
  currency: "COP";
  signature: string;
  redirectUrl: string;
  customerData: { email: string; fullName: string; phoneNumber: string; phoneNumberPrefix: "+57" };
  shippingAddress: { addressLine1: string; addressLine2?: string; city: string; region: string; country: "CO"; phoneNumber: string; name: string };
  onTransaction?: (transaction: WompiTransaction) => void;
}>;

type WompiWidget = new (options: {
  currency: "COP";
  amountInCents: number;
  reference: string;
  publicKey: string;
  signature: { integrity: string };
  redirectUrl: string;
  customerData: { email: string; fullName: string; phoneNumber: string; phoneNumberPrefix: "+57" };
  shippingAddress: { addressLine1: string; addressLine2?: string; city: string; region: string; country: "CO"; phoneNumber: string; name: string };
}) => {
  open: (callback: (result: { transaction?: WompiTransaction }) => void) => void;
};

declare global {
  interface Window {
    WidgetCheckout?: WompiWidget;
  }
}

function getWidgetButtonLabel(scriptReady: boolean, scriptError: boolean) {
  if (scriptReady) return "ABRIR PAGO SEGURO";
  if (scriptError) return "WOMPI NO DISPONIBLE";
  return "CARGANDO WOMPI...";
}

export function WompiCheckout({
  publicKey,
  reference,
  amountInCents,
  currency,
  signature,
  redirectUrl,
  customerData,
  shippingAddress,
  onTransaction,
}: WompiCheckoutProps) {
  const [scriptReady, setScriptReady] = useState(false);
  const [scriptError, setScriptError] = useState(false);
  const buttonLabel = getWidgetButtonLabel(scriptReady, scriptError);

  const openCheckout = () => {
    if (!window.WidgetCheckout) return;

    const checkout = new window.WidgetCheckout({
      currency,
      amountInCents,
      reference,
      publicKey,
      signature: { integrity: signature },
      redirectUrl,
      customerData,
      shippingAddress,
    });

    checkout.open(({ transaction }) => {
      onTransaction?.(transaction ?? {});
    });
  };

  return (
    <>
      <Script
        src="https://checkout.wompi.co/widget.js"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
        onError={() => setScriptError(true)}
      />
      <button type="button" className="cart-checkout-button" onClick={openCheckout} disabled={!scriptReady}>
        {buttonLabel} <span aria-hidden="true">→</span>
      </button>
      {scriptError ? <p className="checkout-feedback is-error" role="alert">No se pudo cargar el checkout seguro de Wompi. El pedido conserva su estado para reintentar más tarde.</p> : null}
    </>
  );
}
