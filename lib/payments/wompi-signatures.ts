import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export type WompiEvent = {
  event?: string;
  environment?: "test" | "prod";
  data?: {
    transaction?: {
      id?: string;
      reference?: string;
      status?: string;
      amount_in_cents?: number;
      currency?: string;
      merchant?: { id?: string };
    };
  };
  signature?: {
    checksum?: string;
    properties?: string[];
  };
  timestamp?: number;
};

const STATUS_PRIORITY: Record<string, number> = {
  PENDING: 0,
  DECLINED: 1,
  ERROR: 1,
  APPROVED: 2,
  VOIDED: 3,
};

export function shouldApplyWompiStatus(currentStatus: string, incomingStatus: string) {
  const currentPriority = STATUS_PRIORITY[currentStatus];
  const incomingPriority = STATUS_PRIORITY[incomingStatus];
  return incomingPriority !== undefined && (
    currentPriority === undefined ||
    incomingPriority > currentPriority
  );
}

export function createWompiReference(orderNumber: string) {
  const suffix = randomBytes(12).toString("hex").toUpperCase();
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
  checksumHeader?: string | null,
) {
  const checksum = event.signature?.checksum ?? checksumHeader;
  const properties = event.signature?.properties;
  const timestamp = event.timestamp;
  if (
    !checksum ||
    !/^[a-f\d]{64}$/i.test(checksum) ||
    !Array.isArray(properties) ||
    properties.length === 0 ||
    properties.length > 100 ||
    properties.some((property) => typeof property !== "string" || property.length === 0 || property.length > 200) ||
    !Number.isSafeInteger(timestamp) ||
    timestamp! < 0 ||
    !eventsSecret
  ) {
    return false;
  }
  if (checksumHeader && event.signature?.checksum && checksumHeader.toLowerCase() !== event.signature.checksum.toLowerCase()) return false;

  const eventData = getNestedValue(rawPayload, "data");
  if (!eventData || typeof eventData !== "object") return false;

  const values = properties.map((property) =>
    getNestedValue(eventData as Record<string, unknown>, property),
  );
  if (values.some((value) => value === undefined || value === null)) return false;

  const expected = createHash("sha256")
    .update(`${values.map((value) => serializeSignatureValue(value)).join("")}${timestamp}${eventsSecret}`)
    .digest("hex");
  const actualBuffer = Buffer.from(checksum, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

function getNestedValue(value: Record<string, unknown>, path: string) {
  return path.split(".").reduce<unknown>((current, key) => {
    if (!current || typeof current !== "object" || ["__proto__", "constructor", "prototype"].includes(key)) {
      return undefined;
    }
    return (current as Record<string, unknown>)[key];
  }, value);
}

function serializeSignatureValue(value: unknown) {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return JSON.stringify(value) ?? "";
}