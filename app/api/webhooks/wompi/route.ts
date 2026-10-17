import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { readLimitedRequestBody, RequestBodyTooLargeError } from "@/lib/http/read-limited-request-body";
import { parseWompiTransactionEvent } from "@/lib/payments/wompi-events";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getWompiConfig, verifyWompiEventSignature, type WompiEvent } from "@/lib/payments/wompi";

export const runtime = "nodejs";

async function readVerifiedEvent(request: Request, eventsSecret: string, environment: "sandbox" | "production") {
  let rawBody: string;
  try {
    rawBody = await readLimitedRequestBody(request, 65536);
  } catch (error) {
    const status = error instanceof RequestBodyTooLargeError ? 413 : 400;
    return { response: NextResponse.json({ error: status === 413 ? "El evento excede el tamaño permitido." : "El cuerpo debe ser JSON válido." }, { status }) };
  }
  let payload: Record<string, unknown>;
  try {
    const value: unknown = JSON.parse(rawBody);
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid payload");
    payload = value as Record<string, unknown>;
  } catch {
    return { response: NextResponse.json({ error: "El cuerpo debe ser JSON válido." }, { status: 400 }) };
  }

  const event = payload as WompiEvent;
  const checksumHeader = request.headers.get("x-event-checksum");
  if (!verifyWompiEventSignature(event, payload, eventsSecret, checksumHeader)) {
    return { response: NextResponse.json({ error: "Firma de evento inválida." }, { status: 401 }) };
  }
  const expectedEventEnvironment = environment === "sandbox" ? "test" : "prod";
  if (event.environment !== expectedEventEnvironment) {
    return { response: NextResponse.json({ error: "El evento pertenece a otro ambiente." }, { status: 401 }) };
  }
  return { event, checksum: (event.signature?.checksum ?? checksumHeader ?? "").toLowerCase() };
}

export async function POST(request: Request) {
  const config = getWompiConfig();
  if (!config) return NextResponse.json({ error: "Wompi no está configurado para este ambiente." }, { status: 503 });

  const verified = await readVerifiedEvent(request, config.eventsSecret, config.environment);
  if ("response" in verified) return verified.response;
  const parsed = parseWompiTransactionEvent(verified.event, config.publicKey);
  if (parsed.kind === "ignored") return NextResponse.json({ received: true, ignored: true });
  if (parsed.kind === "invalid" || !Number.isSafeInteger(verified.event.timestamp)) return NextResponse.json({ error: "Evento de transacción incompleto o no soportado." }, { status: 400 });
  const transaction = parsed.transaction;

  try {
    const eventKey = createHash("sha256")
      .update(`${config.environment}\u0000${verified.checksum}\u0000${verified.event.timestamp}`)
      .digest("hex");
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.rpc("apply_wompi_transaction", {
      p_event_key: eventKey,
      p_source: "webhook",
      p_reference: transaction.reference,
      p_transaction_id: transaction.id,
      p_wompi_status: transaction.status,
      p_amount_in_cents: transaction.amountInCents,
      p_currency: transaction.currency,
      p_environment: config.environment,
      p_event_timestamp: verified.event.timestamp!,
    });
    if (error) return NextResponse.json({ error: "El evento se reintentará." }, { status: 503 });
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "El evento se reintentará." }, { status: 503 });
  }
}