import "server-only";
import type { WompiConfig } from "@/lib/payments/wompi-config";
import { requestWompiTransaction } from "@/lib/payments/wompi-api-request";

export { WompiApiError } from "@/lib/payments/wompi-api-request";

export async function getWompiTransaction(
  config: WompiConfig,
  transactionId: string,
  fetcher: typeof fetch = fetch,
) {
  return requestWompiTransaction(config, transactionId, fetcher);
}
