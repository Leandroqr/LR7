import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createWompiIntegritySignature, createWompiReference, getWompiConfig } from "@/lib/payments/wompi";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const config = getWompiConfig();
  if (!config) {
    return NextResponse.json({ error: "Wompi no está configurado en este entorno." }, { status: 503 });
  }

  const body = await request.json().catch(() => null) as { orderId?: unknown } | null;
  if (!body || typeof body.orderId !== "string" || !body.orderId.trim()) {
    return NextResponse.json({ error: "orderId es obligatorio." }, { status: 400 });
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data: order, error } = await supabase
      .from("orders")
      .select("id, order_number, total, currency, status")
      .eq("id", body.orderId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!order) return NextResponse.json({ error: "Pedido no encontrado." }, { status: 404 });
    if (order.currency !== "COP") return NextResponse.json({ error: "Wompi solo admite pedidos en COP." }, { status: 400 });
    if (["paid", "cancelled", "refunded"].includes(order.status)) {
      return NextResponse.json({ error: "El pedido no puede iniciar un nuevo pago." }, { status: 409 });
    }

    const reference = createWompiReference(order.order_number);
    const signature = createWompiIntegritySignature(reference, order.total * 100, order.currency, config.integritySecret);
    const { error: paymentError } = await supabase.from("payments").insert({
      order_id: order.id,
      provider: "wompi",
      transaction_id: null,
      status: "pending",
      amount: order.total,
      currency: order.currency,
      metadata: { reference, environment: config.environment },
    });

    if (paymentError) throw new Error(paymentError.message);

    return NextResponse.json({
      publicKey: config.publicKey,
      reference,
      amountInCents: order.total * 100,
      currency: order.currency,
      signature,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No fue posible preparar el pago.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}