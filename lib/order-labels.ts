// Nombres en español de los estados de pedido y de pago (solo presentación; los códigos de datos no cambian).
// Sin dependencias para node --test.
const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente de pago",
  payment_pending: "Verificando el pago",
  paid: "Pagado",
  processing: "En preparación",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  approved: "Aprobado",
  rejected: "Rechazado",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
};

function fallbackLabel(code: string) {
  const text = code.replaceAll("_", " ").trim().toLowerCase();
  return text ? text[0].toUpperCase() + text.slice(1) : "Sin estado";
}

export function getOrderStatusLabel(status: string) {
  return ORDER_STATUS_LABELS[status] ?? fallbackLabel(status);
}

export function getPaymentStatusLabel(status: string) {
  return PAYMENT_STATUS_LABELS[status.toLowerCase()] ?? fallbackLabel(status);
}
