export const WOMPI_TRANSACTION_STATUSES = ["PENDING", "APPROVED", "DECLINED", "ERROR", "VOIDED"] as const;

export type WompiTransactionStatus = (typeof WOMPI_TRANSACTION_STATUSES)[number];

export type VerifiedWompiTransaction = Readonly<{
  id: string;
  reference: string;
  status: WompiTransactionStatus;
  amountInCents: number;
  currency: "COP";
  merchantId: string;
}>;

export function parseWompiTransactionResponse(payload: unknown, expectedMerchantId: string): VerifiedWompiTransaction | null {
  if (!payload || typeof payload !== "object" || !("data" in payload)) return null;
  const transaction = (payload as { data?: unknown }).data;
  if (!transaction || typeof transaction !== "object") return null;

  const data = transaction as Record<string, unknown>;
  const merchant = data.merchant;
  const merchantId = merchant && typeof merchant === "object"
    ? (merchant as Record<string, unknown>).id
    : null;

  if (
    typeof data.id !== "string" || !/^[A-Za-z0-9-]{1,128}$/.test(data.id) ||
    typeof data.reference !== "string" || data.reference.length < 1 || data.reference.length > 255 ||
    typeof data.status !== "string" || !WOMPI_TRANSACTION_STATUSES.includes(data.status as WompiTransactionStatus) ||
    !Number.isSafeInteger(data.amount_in_cents) || (data.amount_in_cents as number) <= 0 ||
    data.currency !== "COP" ||
    (merchantId !== undefined && merchantId !== null && merchantId !== expectedMerchantId)
  ) {
    return null;
  }

  return {
    id: data.id,
    reference: data.reference,
    status: data.status as WompiTransactionStatus,
    amountInCents: data.amount_in_cents as number,
    currency: "COP",
    merchantId: typeof merchantId === "string" ? merchantId : expectedMerchantId,
  };
}
