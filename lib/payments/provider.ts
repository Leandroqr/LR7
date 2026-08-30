import "server-only";

import type { PaymentProvider as PaymentProviderName, PaymentStatus } from "@/types/database";

export type PaymentRedirect = {
  provider: PaymentProviderName;
  transactionId: string;
  redirectUrl: string;
};

export type VerifiedPaymentEvent = {
  provider: PaymentProviderName;
  transactionId: string;
  orderId: string;
  amount: number;
  currency: "COP";
  status: PaymentStatus;
  metadata: Record<string, string | number | boolean | null>;
};

export interface PaymentProvider {
  createPayment(orderId: string): Promise<PaymentRedirect>;
  verifyWebhook(request: Request): Promise<VerifiedPaymentEvent>;
  getPayment(transactionId: string): Promise<VerifiedPaymentEvent>;
  cancelPayment(transactionId: string): Promise<void>;
  refundPayment(transactionId: string, amount?: number): Promise<void>;
}
