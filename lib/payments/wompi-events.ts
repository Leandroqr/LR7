export const WOMPI_TRANSACTION_STATUSES = ["PENDING", "APPROVED", "DECLINED", "ERROR", "VOIDED"] as const;
export type WompiTransactionStatus = (typeof WOMPI_TRANSACTION_STATUSES)[number];

type WompiEvent = Readonly<{
  event?: string;
  data?: { transaction?: {
    id?: string;
    reference?: string;
    status?: string;
    amount_in_cents?: number;
    currency?: string;
    merchant?: { id?: string };
  } };
}>;

export type ParsedWompiTransactionEvent = Readonly<{
  id: string;
  reference: string;
  status: WompiTransactionStatus;
  amountInCents: number;
  currency: "COP";
}>;

export function parseWompiTransactionEvent(event: WompiEvent, expectedMerchantId: string) {
  if (event.event !== "transaction.updated") return { kind: "ignored" as const };
  const transaction = event.data?.transaction;
  const merchantId = transaction?.merchant?.id;
  if (
    typeof transaction?.id !== "string" || !/^[A-Za-z0-9-]{1,128}$/.test(transaction.id) ||
    typeof transaction.reference !== "string" || transaction.reference.length < 1 || transaction.reference.length > 255 ||
    typeof transaction.status !== "string" || !WOMPI_TRANSACTION_STATUSES.includes(transaction.status as WompiTransactionStatus) ||
    !Number.isSafeInteger(transaction.amount_in_cents) || transaction.amount_in_cents! <= 0 ||
    transaction.currency !== "COP" ||
    (merchantId !== undefined && merchantId !== expectedMerchantId)
  ) {
    return { kind: "invalid" as const };
  }
  return {
    kind: "transaction" as const,
    transaction: {
      id: transaction.id,
      reference: transaction.reference,
      status: transaction.status as WompiTransactionStatus,
      amountInCents: transaction.amount_in_cents!,
      currency: "COP" as const,
    },
  };
}
