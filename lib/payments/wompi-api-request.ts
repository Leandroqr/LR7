export class WompiApiError extends Error {
  readonly status: number;

  constructor(status: number) {
    super("Wompi transaction lookup failed.");
    this.status = status;
  }
}

export type WompiApiConfig = Readonly<{
  environment: "sandbox" | "production";
  privateKey: string;
}>;

const API_BASES = {
  sandbox: "https://sandbox.wompi.co/v1",
  production: "https://production.wompi.co/v1",
} as const;

export async function requestWompiTransaction(
  config: WompiApiConfig,
  transactionId: string,
  fetcher: typeof fetch = fetch,
) {
  if (!/^[A-Za-z0-9-]{1,128}$/.test(transactionId)) throw new WompiApiError(400);
  const response = await fetcher(`${API_BASES[config.environment]}/transactions/${encodeURIComponent(transactionId)}`, {
    method: "GET",
    headers: { accept: "application/json", authorization: `Bearer ${config.privateKey}` },
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new WompiApiError(response.status);
  return response.json() as Promise<unknown>;
}
