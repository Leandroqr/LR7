import "server-only";
import { parseWompiConfig, type WompiConfig } from "@/lib/payments/wompi-config";

export {
  createWompiIntegritySignature,
  createWompiReference,
  shouldApplyWompiStatus,
  verifyWompiEventSignature,
} from "@/lib/payments/wompi-signatures";
export type { WompiEvent } from "@/lib/payments/wompi-signatures";

export type { WompiConfig, WompiEnvironment } from "@/lib/payments/wompi-config";

export function getWompiConfig(): WompiConfig | null {
  return parseWompiConfig(process.env.WOMPI_ENV, process.env);
}