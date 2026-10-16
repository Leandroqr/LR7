import "server-only";

export {
  createWompiIntegritySignature,
  createWompiReference,
  shouldApplyWompiStatus,
  verifyWompiEventSignature,
} from "@/lib/payments/wompi-signatures";
export type { WompiEvent } from "@/lib/payments/wompi-signatures";

export type WompiEnvironment = "sandbox";

export type WompiConfig = {
  environment: WompiEnvironment;
  publicKey: string;
  integritySecret: string;
  eventsSecret: string;
};

export function getWompiConfig(): WompiConfig | null {
  const publicKey = process.env.WOMPI_PUBLIC_KEY?.trim() ?? "";
  const integritySecret = process.env.WOMPI_INTEGRITY_SECRET?.trim() ?? "";
  const eventsSecret = process.env.WOMPI_EVENTS_SECRET?.trim() ?? "";
  const configuredEnvironment = process.env.WOMPI_ENV?.trim();

  if (
    configuredEnvironment !== "sandbox" ||
    !publicKey ||
    !integritySecret ||
    !eventsSecret ||
    !publicKey.startsWith("pub_test_") ||
    publicKey.includes("TU_LLAVE") ||
    integritySecret.includes("TU_SECRETO") ||
    eventsSecret.includes("TU_SECRETO")
  ) {
    return null;
  }

  return {
    environment: "sandbox",
    publicKey,
    integritySecret,
    eventsSecret,
  };
}