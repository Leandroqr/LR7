export type WompiEnvironment = "sandbox" | "production";

export type WompiConfig = Readonly<{
  environment: WompiEnvironment;
  publicKey: string;
  privateKey: string;
  integritySecret: string;
  eventsSecret: string;
  apiBaseUrl: string;
}>;

type WompiEnvironmentVariables = Readonly<Record<string, string | undefined>>;

const ENVIRONMENT_CONFIG = {
  sandbox: {
    publicPrefix: "pub_test_",
    privatePrefix: "prv_test_",
    integrityPrefix: "test_integrity_",
    eventsPrefix: "test_events_",
    apiBaseUrl: "https://sandbox.wompi.co/v1",
  },
  production: {
    publicPrefix: "pub_prod_",
    privatePrefix: "prv_prod_",
    integrityPrefix: "prod_integrity_",
    eventsPrefix: "prod_events_",
    apiBaseUrl: "https://production.wompi.co/v1",
  },
} as const;

function readConfiguredValue(value: string | undefined) {
  const normalized = value?.trim() ?? "";
  if (!normalized || normalized.includes("...") || /^(TU_|REPLACE|EXAMPLE|YOUR)/i.test(normalized)) return null;
  return normalized;
}

export function parseWompiConfig(environmentValue: string | undefined, variables: WompiEnvironmentVariables): WompiConfig | null {
  if (environmentValue !== "sandbox" && environmentValue !== "production") return null;

  const expected = ENVIRONMENT_CONFIG[environmentValue];
  const publicKey = readConfiguredValue(variables.WOMPI_PUBLIC_KEY);
  const privateKey = readConfiguredValue(variables.WOMPI_PRIVATE_KEY);
  const integritySecret = readConfiguredValue(variables.WOMPI_INTEGRITY_SECRET);
  const eventsSecret = readConfiguredValue(variables.WOMPI_EVENTS_SECRET);

  if (
    !publicKey?.startsWith(expected.publicPrefix) ||
    !privateKey?.startsWith(expected.privatePrefix) ||
    !integritySecret?.startsWith(expected.integrityPrefix) ||
    !eventsSecret?.startsWith(expected.eventsPrefix)
  ) {
    return null;
  }

  return {
    environment: environmentValue,
    publicKey,
    privateKey,
    integritySecret,
    eventsSecret,
    apiBaseUrl: expected.apiBaseUrl,
  };
}

export function getWompiEnvironmentValue(variables: WompiEnvironmentVariables) {
  return variables.WOMPI_ENV;
}
