import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  getWompiConfig,
  shouldApplyWompiStatus,
  verifyWompiEventSignature,
  type WompiEvent,
} from "@/lib/payments/wompi";
import type { OrderStatus, PaymentStatus } from "@/types/database";

export const runtime = "nodejs";

const STATUS_MAP: Record<string, { order: OrderStatus; payment: PaymentStatus }> = {
  APPROVED: { order: "paid", payment: "approved" },
  DECLINED: { order: "payment_pending", payment: "rejected" },
  ERROR: { order: "payment_pending", payment: "rejected" },
  PENDING: { order: "payment_pending", payment: "pending" },
  VOIDED: { order: "cancelled", payment: "cancelled" },
};

type ValidatedTransaction = {
  id: string;
  reference: string;
  status: keyof typeof STATUS_MAP;
  amount_in_cents: number;
  currency: "COP";
};

type ParsedTransactionEvent =
  | { kind: "ignored" }
  | { kind: "invalid" }
  | { kind: "transaction"; transaction: ValidatedTransaction; status: (typeof STATUS_MAP)[string] };

function parseTransactionEvent(event: WompiEvent): ParsedTransactionEvent {
  if (event.event !== "transaction.updated") return { kind: "ignored" };

  const transaction = event.data?.transaction;
  const status = transaction?.status ? STATUS_MAP[transaction.status] : undefined;
  if (
    typeof transaction?.id !== "string" ||
    typeof transaction.reference !== "string" ||
    transaction.reference.length === 0 || transaction.reference.length > 255 ||
    !Number.isSafeInteger(transaction.amount_in_cents) || transaction.amount_in_cents! <= 0 ||
    transaction.currency !== "COP" ||
    !status
  ) {
    return { kind: "invalid" };
  }

  return {
    kind: "transaction",
    transaction: {
      id: transaction.id,
      reference: transaction.reference,
      status: transaction.status as keyof typeof STATUS_MAP,
      amount_in_cents: transaction.amount_in_cents!,
      currency: "COP",
    },
    status,
  };
}

async function readVerifiedEvent(request: Request, eventsSecret: string) {
  const rawBody = await request.text();
  if (rawBody.length > 65536) {
    return { response: NextResponse.json({ error: "El evento excede el tamaño permitido." }, { status: 413 }) };
  }

  let payload: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(rawBody);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("El evento debe ser un objeto JSON.");
    }
    payload = parsed as Record<string, unknown>;
  } catch {
    return { response: NextResponse.json({ error: "El cuerpo debe ser JSON válido." }, { status: 400 }) };
  }

  const event = payload as WompiEvent;
  if (!verifyWompiEventSignature(event, payload, eventsSecret)) {
    return { response: NextResponse.json({ error: "Firma de evento inválida." }, { status: 401 }) };
  }
  if (event.environment !== "test") {
    return { response: NextResponse.json({ error: "El evento pertenece a otro entorno." }, { status: 401 }) };
  }

  return { event };
}

function matchesExpectedPayment(
  order: { total: number; currency: string },
  payment: { amount: number; currency: string },
  transaction: ValidatedTransaction,
) {
  return Number.isSafeInteger(order.total * 100) &&
    payment.amount === order.total &&
    payment.currency === order.currency &&
    order.currency === transaction.currency &&
    order.total * 100 === transaction.amount_in_cents;
}

function getEligibleOrderStatuses(paymentStatus: PaymentStatus): OrderStatus[] {
  if (paymentStatus === "cancelled") return ["pending", "payment_pending", "paid"];
  if (paymentStatus === "approved") return ["pending", "payment_pending", "cancelled"];
  return ["pending", "payment_pending"];
}

async function updatePaymentStatus(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  payment: {
    id: string;
    status: PaymentStatus;
    transaction_id: string | null;
  },
  transaction: NonNullable<WompiEvent["data"]>["transaction"],
  nextStatus: { order: OrderStatus; payment: PaymentStatus },
  event: WompiEvent,
  reference: string,
  environment: string,
) {
  if (!transaction?.id || !transaction.status) return "conflict" as const;
  if (payment.transaction_id && payment.transaction_id !== transaction.id) return "conflict" as const;
  if (!shouldApplyWompiStatus(payment.status, transaction.status)) return "stale" as const;

  let updateQuery = supabase
    .from("payments")
    .update({
      transaction_id: transaction.id,
      status: nextStatus.payment,
      metadata: {
        reference,
        environment,
        event: event.event ?? null,
        wompi_status: transaction.status,
        timestamp: event.timestamp ?? null,
      },
    })
    .eq("id", payment.id)
    .eq("status", payment.status);
  updateQuery = payment.transaction_id
    ? updateQuery.eq("transaction_id", payment.transaction_id)
    : updateQuery.is("transaction_id", null);

  const { data, error } = await updateQuery.select("id").maybeSingle();
  if (error) throw new Error("No fue posible guardar el estado del pago.");
  if (data) return "updated" as const;

  const { data: latestPayment, error: latestError } = await supabase
    .from("payments")
    .select("status, transaction_id")
    .eq("id", payment.id)
    .maybeSingle();
  if (latestError) throw new Error("No fue posible consultar el estado del pago.");
  if (!latestPayment || (latestPayment.transaction_id && latestPayment.transaction_id !== transaction.id)) {
    return "conflict" as const;
  }
  return shouldApplyWompiStatus(latestPayment.status, transaction.status) ? "retry" as const : "stale" as const;
}

async function processTransaction(
  event: WompiEvent,
  environment: string,
  transaction: ValidatedTransaction,
  status: (typeof STATUS_MAP)[string],
) {
  const supabase = createSupabaseAdminClient();
  const { data: payment, error: paymentLookupError } = await supabase
    .from("payments")
    .select("id, order_id, transaction_id, status, amount, currency")
    .eq("provider", "wompi")
    .contains("metadata", { reference: transaction.reference })
    .maybeSingle();
  if (paymentLookupError) throw new Error("No fue posible consultar el pago.");
  if (!payment) return NextResponse.json({ error: "Referencia de pago desconocida." }, { status: 404 });

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, total, currency")
    .eq("id", payment.order_id)
    .maybeSingle();
  if (orderError) throw new Error("No fue posible consultar el pedido.");
  if (!order) return NextResponse.json({ error: "Pedido asociado no encontrado." }, { status: 404 });
  if (!matchesExpectedPayment(order, payment, transaction)) {
    return NextResponse.json({ error: "El monto o la moneda no coinciden con el pedido." }, { status: 409 });
  }

  const paymentResult = await updatePaymentStatus(
    supabase,
    payment,
    transaction,
    status,
    event,
    transaction.reference,
    environment,
  );
  if (paymentResult === "conflict") {
    return NextResponse.json({ error: "El pago tiene una transacción diferente." }, { status: 409 });
  }
  if (paymentResult === "retry") {
    return NextResponse.json({ error: "Actualización concurrente; Wompi puede reintentar." }, { status: 503 });
  }
  if (paymentResult === "stale") return NextResponse.json({ received: true, ignored: true });

  const { error: updateError } = await supabase
    .from("orders")
    .update({ status: status.order })
    .eq("id", order.id)
    .in("status", getEligibleOrderStatuses(status.payment));
  if (updateError) throw new Error("No fue posible guardar el estado del pedido.");
  return NextResponse.json({ received: true });
}

export async function POST(request: Request) {
  const config = getWompiConfig();
  if (!config) return NextResponse.json({ error: "Wompi no está configurado en Sandbox." }, { status: 503 });

  const verified = await readVerifiedEvent(request, config.eventsSecret);
  if ("response" in verified) return verified.response;
  if (verified.event.event !== "transaction.updated") {
    return NextResponse.json({ received: true, ignored: true });
  }

  const parsed = parseTransactionEvent(verified.event);
  if (parsed.kind === "ignored") return NextResponse.json({ received: true, ignored: true });
  if (parsed.kind === "invalid") {
    return NextResponse.json({ error: "Evento de transacción incompleto o no soportado." }, { status: 400 });
  }

  try {
    return await processTransaction(
      verified.event,
      "test",
      parsed.transaction,
      parsed.status,
    );
  } catch {
    return NextResponse.json({ error: "No fue posible procesar el evento." }, { status: 500 });
  }
}