import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getWompiConfig, verifyWompiEventSignature, type WompiEvent } from "@/lib/payments/wompi";
import type { OrderStatus, PaymentStatus } from "@/types/database";

export const runtime = "nodejs";

const STATUS_MAP: Record<string, { order: OrderStatus; payment: PaymentStatus }> = {
  APPROVED: { order: "paid", payment: "approved" },
  DECLINED: { order: "payment_pending", payment: "rejected" },
  PENDING: { order: "payment_pending", payment: "pending" },
  VOIDED: { order: "cancelled", payment: "cancelled" },
};

export async function POST(request: Request) {
  const config = getWompiConfig();
  if (!config) return NextResponse.json({ error: "Wompi no está configurado." }, { status: 503 });

  const rawBody = await request.text();
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "El cuerpo debe ser JSON válido." }, { status: 400 });
  }

  const event = payload as WompiEvent;
  if (!verifyWompiEventSignature(event, payload, config.eventsSecret)) {
    return NextResponse.json({ error: "Firma de evento inválida." }, { status: 401 });
  }

  const transaction = event.data?.transaction;
  const status = transaction?.status ? STATUS_MAP[transaction.status] : undefined;
  if (
    !transaction?.id ||
    !transaction.reference ||
    typeof transaction.amount_in_cents !== "number" ||
    !transaction.currency ||
    !status
  ) {
    return NextResponse.json({ error: "Evento de transacción incompleto o no soportado." }, { status: 400 });
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, total, currency")
      .eq("order_number", transaction.reference.slice(0, transaction.reference.lastIndexOf("-")))
      .maybeSingle();

    if (orderError) throw new Error(orderError.message);
    if (!order) return NextResponse.json({ error: "Pedido asociado no encontrado." }, { status: 404 });
    if (order.currency !== transaction.currency || order.total * 100 !== transaction.amount_in_cents) {
      return NextResponse.json({ error: "El monto o la moneda no coinciden con el pedido." }, { status: 409 });
    }

    const { error: paymentError } = await supabase.from("payments").upsert({
      order_id: order.id,
      provider: "wompi",
      transaction_id: transaction.id,
      status: status.payment,
      amount: order.total,
      currency: order.currency,
      metadata: { event: event.event ?? null, reference: transaction.reference },
    }, { onConflict: "provider,transaction_id" });
    if (paymentError) throw new Error(paymentError.message);

    const { error: updateError } = await supabase.from("orders").update({ status: status.order }).eq("id", order.id);
    if (updateError) throw new Error(updateError.message);

    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No fue posible procesar el evento.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}