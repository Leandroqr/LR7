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
  onTransaction?: (transaction: WompiTransaction) => void;
}>;

type WompiWidget = new (options: {
  currency: "COP";
  amountInCents: number;
  reference: string;
  publicKey: string;
  signature: { integrity: string };
}) => {
  open: (callback: (result: { transaction?: WompiTransaction }) => void) => void;
};

declare global {
  interface Window {
    WidgetCheckout?: WompiWidget;
  }
}

export function WompiCheckout({
  publicKey,
  reference,
  amountInCents,
  currency,
  signature,
  onTransaction,
}: WompiCheckoutProps) {
  const [scriptReady, setScriptReady] = useState(false);

  const openCheckout = () => {
    if (!window.WidgetCheckout) return;

    const checkout = new window.WidgetCheckout({
      currency,
      amountInCents,
      reference,
      publicKey,
      signature: { integrity: signature },
    });

    checkout.open(({ transaction }) => {
      if (transaction) onTransaction?.(transaction);
    });
  };

  return (
    <>
      <Script
        src="https://checkout.wompi.co/widget.js"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
      />
      <button type="button" onClick={openCheckout} disabled={!scriptReady}>
        CONTINUAR AL PAGO <span aria-hidden="true">→</span>
      </button>
    </>
  );
}
