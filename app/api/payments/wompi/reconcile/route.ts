import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { readLimitedRequestBody, RequestBodyTooLargeError } from "@/lib/http/read-limited-request-body";
import { getOrderAccessCookieName, matchesOrderAccessToken } from "@/lib/payments/order-access";
import { getWompiTransaction, WompiApiError } from "@/lib/payments/wompi-api";
import { getWompiConfig } from "@/lib/payments/wompi";
import { parseWompiTransactionResponse } from "@/lib/payments/wompi-transactions";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const reconcileRequestSchema = z.object({ orderId: z.uuid(), transactionId: z.string().regex(/^[A-Za-z0-9-]{1,128}$/) });

function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

async function readReconcileRequest(request: Request) {
  try {
    const payload = JSON.parse(await readLimitedRequestBody(request, 4096)) as unknown;
    const parsed = reconcileRequestSchema.safeParse(payload);
    return parsed.success
      ? { value: parsed.data }
      : { response: NextResponse.json({ error: "La solicitud de verificación no es válida." }, { status: 400 }) };
  } catch (error) {
    const status = error instanceof RequestBodyTooLargeError ? 413 : 400;
    return { response: NextResponse.json({ error: status === 413 ? "La solicitud excede el tamaño permitido." : "El cuerpo JSON no es válido." }, { status }) };
  }
}

async function getAuthorizedOrder(orderId: string, userId: string | null, accessToken: string) {
  const supabase = createSupabaseAdminClient();
  const { data: order, error } = await supabase.from("orders")
    .select("id, user_id, public_access_token_hash")
    .eq("id", orderId)
    .maybeSingle();
  if (error) throw new Error("order_lookup_failed");
  const isOwner = userId === order?.user_id && order?.user_id !== null;
  const hasGuestAccess = matchesOrderAccessToken(accessToken, order?.public_access_token_hash ?? null);
  return order && (isOwner || hasGuestAccess) ? { order, supabase } : null;
}

async function verifyAndApplyTransaction(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  orderId: string,
  transactionId: string,
  config: NonNullable<ReturnType<typeof getWompiConfig>>,
) {
  const payload = await getWompiTransaction(config, transactionId);
  const transaction = parseWompiTransactionResponse(payload, config.publicKey);
  if (transaction?.id !== transactionId) return false;

  const { data: payment, error: paymentError } = await supabase.from("payments")
    .select("id")
    .eq("order_id", orderId)
    .eq("provider", "wompi")
    .eq("reference", transaction.reference)
    .eq("environment", config.environment)
    .maybeSingle();
  if (paymentError || !payment) return false;

  const eventKey = createHash("sha256")
    .update(`reconciliation\u0000${transaction.id}\u0000${transaction.status}\u0000${transaction.amountInCents}\u0000${transaction.currency}`)
    .digest("hex");
  const { error } = await supabase.rpc("apply_wompi_transaction", {
    p_event_key: eventKey,
    p_source: "reconciliation",
    p_reference: transaction.reference,
    p_transaction_id: transaction.id,
    p_wompi_status: transaction.status,
    p_amount_in_cents: transaction.amountInCents,
    p_currency: transaction.currency,
    p_environment: config.environment,
    p_event_timestamp: Math.floor(Date.now() / 1000),
  });
  if (error) throw new Error("payment_reconciliation_failed");
  return true;
}

async function authorizeOrderAccess(orderId: string) {
  const cookieName = getOrderAccessCookieName(orderId);
  if (!cookieName) return null;
  const [cookieStore, sessionClient] = await Promise.all([cookies(), createSupabaseServerClient()]);
  const { data: { user } } = sessionClient ? await sessionClient.auth.getUser() : { data: { user: null } };
  const token = cookieStore.get(cookieName)?.value ?? "";
  return getAuthorizedOrder(orderId, user?.id ?? null, token);
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Origen no permitido." }, { status: 403 });
  const config = getWompiConfig();
  if (!config) return NextResponse.json({ error: "Wompi no está configurado." }, { status: 503 });
  const body = await readReconcileRequest(request);
  if ("response" in body) return body.response;

  try {
    const access = await authorizeOrderAccess(body.value.orderId);
    if (!access) return NextResponse.json({ error: "Pedido no encontrado." }, { status: 404 });
    const verified = await verifyAndApplyTransaction(access.supabase, access.order.id, body.value.transactionId, config);
    if (!verified) return NextResponse.json({ error: "La transacción no corresponde a este pedido." }, { status: 409 });
    return NextResponse.json({ received: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const status = error instanceof WompiApiError && error.status === 404 ? 409 : 503;
    return NextResponse.json({ error: "No fue posible confirmar el estado con Wompi." }, { status, headers: { "Cache-Control": "no-store" } });
  }
}
