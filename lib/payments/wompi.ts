import "server-only";

import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

const WOMPI_API_URLS = {
  sandbox: "https://sandbox.wompi.co/v1",
  production: "https://production.wompi.co/v1",
} as const;

export type WompiEnvironment = keyof typeof WOMPI_API_URLS;

export type WompiConfig = {
  environment: WompiEnvironment;
  publicKey: string;
  privateKey: string;
  integritySecret: string;
  eventsSecret: string;
  apiUrl: string;
};

export function getWompiConfig(): WompiConfig | null {
  const publicKey = process.env.WOMPI_PUBLIC_KEY?.trim() ?? "";
  const privateKey = process.env.WOMPI_PRIVATE_KEY?.trim() ?? "";
  const integritySecret = process.env.WOMPI_INTEGRITY_SECRET?.trim() ?? "";
  const eventsSecret = process.env.WOMPI_EVENTS_SECRET?.trim() ?? "";
  const environment = process.env.WOMPI_ENV === "production" ? "production" : "sandbox";

  if (
    !publicKey ||
    !privateKey ||
    !integritySecret ||
    !eventsSecret ||
    publicKey.includes("TU_LLAVE") ||
    privateKey.includes("TU_LLAVE") ||
    integritySecret.includes("TU_SECRETO") ||
    eventsSecret.includes("TU_SECRETO")
  ) {
    return null;
  }

  return {
    environment,
    publicKey,
    privateKey,
    integritySecret,
    eventsSecret,
    apiUrl: WOMPI_API_URLS[environment],
  };
}

export function createWompiReference(orderNumber: string) {
  const suffix = randomBytes(4).toString("hex").toUpperCase();
  return `${orderNumber}-${suffix}`;
}

export function createWompiIntegritySignature(
  reference: string,
  amountInCents: number,
  currency: string,
  integritySecret: string,
) {
  return createHash("sha256")
    .update(`${reference}${amountInCents}${currency}${integritySecret}`)
    .digest("hex");
}

export function verifyWompiEventSignature(
  event: WompiEvent,
  rawPayload: Record<string, unknown>,
  eventsSecret: string,
) {
  const signature = event.signature?.checksum;
  const properties = event.signature?.properties;
  const timestamp = event.timestamp;
  if (!signature || !properties?.length || typeof timestamp !== "number") return false;

  const values = properties.map((property) => getNestedValue(rawPayload, property));
  if (values.some((value) => value === undefined || value === null)) return false;

  const expected = createHash("sha256")
    .update(`${values.map((value) => serializeSignatureValue(value)).join("")}${timestamp}${eventsSecret}`)
    .digest("hex");
  const actualBuffer = Buffer.from(signature, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

export type WompiEvent = {
  event?: string;
  data?: {
    transaction?: {
      id?: string;
      reference?: string;
      status?: string;
      amount_in_cents?: number;
      currency?: string;
    };
  };
  signature?: {
    checksum?: string;
    properties?: string[];
  };
  timestamp?: number;
};

function getNestedValue(value: Record<string, unknown>, path: string) {
  return path.split(".").reduce<unknown>((current, key) => {
    if (!current || typeof current !== "object") return undefined;
    return (current as Record<string, unknown>)[key];
  }, value);
}

function serializeSignatureValue(value: unknown) {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return JSON.stringify(value);
}