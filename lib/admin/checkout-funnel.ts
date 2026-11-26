// Embudo de pago del admin (2026-11-26), calculado con los pedidos de Supabase; no necesita esquema nuevo.
// Un pedido se crea cuando el cliente envía sus datos de entrega y pasa al pago de Wompi, así que
// "pedidos iniciados" equivale a "checkouts que llegaron al pago".
// Sin dependencias para node --test.

export const FUNNEL_PERIODS = ["7", "30", "90"] as const;
export type FunnelPeriod = (typeof FUNNEL_PERIODS)[number];

export type FunnelOrder = Readonly<{
  id: string;
  status: string;
  total: number;
  created_at: string;
  reservation_expires_at: string | null;
}>;

/** Estado del pedido desde el punto de vista del embudo. */
export type FunnelOutcome = "paid" | "in_progress" | "rejected" | "abandoned";

// "refunded" cuenta como pagado: el cliente completó la compra aunque luego se reembolsara.
const PAID_STATUSES = new Set(["paid", "processing", "shipped", "delivered", "refunded"]);
const OPEN_STATUSES = new Set(["pending", "payment_pending"]);

/**
 * - paid: el pago se aprobó.
 * - in_progress: sigue dentro del tiempo de reserva de Wompi; aún puede pagarse.
 * - rejected: Wompi rechazó el pago y no se completó después.
 * - abandoned: la reserva expiró (o se canceló) sin pago y sin rechazo registrado.
 */
export function classifyOrder(order: FunnelOrder, rejectedOrderIds: ReadonlySet<string>, now: Date): FunnelOutcome {
  if (PAID_STATUSES.has(order.status)) return "paid";
  if (OPEN_STATUSES.has(order.status) && order.reservation_expires_at && new Date(order.reservation_expires_at) > now) return "in_progress";
  return rejectedOrderIds.has(order.id) ? "rejected" : "abandoned";
}

export type FunnelBucket = { count: number; value: number };
export type FunnelSummary = Record<FunnelOutcome | "started", FunnelBucket> & {
  /** Pagados / iniciados que ya terminaron (sin contar los que siguen en curso), de 0 a 1; null sin datos. */
  conversionRate: number | null;
  /** Rechazados + abandonados / iniciados que ya terminaron, de 0 a 1; null sin datos. */
  abandonmentRate: number | null;
};

export function summarizeCheckoutFunnel(
  orders: readonly FunnelOrder[],
  rejectedOrderIds: ReadonlySet<string>,
  now: Date = new Date(),
): FunnelSummary {
  const empty = (): FunnelBucket => ({ count: 0, value: 0 });
  const summary = { started: empty(), paid: empty(), in_progress: empty(), rejected: empty(), abandoned: empty() };
  for (const order of orders) {
    const outcome = classifyOrder(order, rejectedOrderIds, now);
    for (const bucket of [summary.started, summary[outcome]]) {
      bucket.count += 1;
      bucket.value += order.total;
    }
  }
  const finished = summary.started.count - summary.in_progress.count;
  return {
    ...summary,
    conversionRate: finished > 0 ? summary.paid.count / finished : null,
    abandonmentRate: finished > 0 ? (summary.rejected.count + summary.abandoned.count) / finished : null,
  };
}

/** Inicio del periodo (hace N días desde `now`). */
export function periodStart(period: FunnelPeriod, now: Date = new Date()) {
  return new Date(now.getTime() - Number(period) * 24 * 60 * 60 * 1000);
}
