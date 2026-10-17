import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getOrderAccessCookieName, matchesOrderAccessToken } from "@/lib/payments/order-access";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieName = getOrderAccessCookieName(id);
  if (!cookieName) return NextResponse.json({ error: "Pedido no encontrado." }, { status: 404, headers: { "Cache-Control": "no-store" } });

  const [cookieStore, sessionClient] = await Promise.all([cookies(), createSupabaseServerClient()]);
  const { data: { user } = { user: null } } = sessionClient ? await sessionClient.auth.getUser() : { data: { user: null } };

  try {
    const supabase = createSupabaseAdminClient();
    const { data: order, error } = await supabase.from("orders")
      .select("id, order_number, user_id, public_access_token_hash, customer_email, customer_name, customer_phone, status, fulfillment_status, fulfillment_hold, fulfillment_hold_reason, subtotal, shipping, discount, total, currency, shipping_information, created_at, reservation_expires_at")
      .eq("id", id)
      .maybeSingle();
    if (error || !order) return NextResponse.json({ error: "Pedido no encontrado." }, { status: 404, headers: { "Cache-Control": "no-store" } });

    const token = cookieStore.get(cookieName)?.value ?? "";
    const isOwner = Boolean(user && order.user_id === user.id);
    const hasGuestAccess = matchesOrderAccessToken(token, order.public_access_token_hash);
    if (!isOwner && !hasGuestAccess) {
      return NextResponse.json({ error: "Pedido no encontrado." }, { status: 404, headers: { "Cache-Control": "no-store" } });
    }

    const { error: expiryError } = await supabase.rpc("expire_wompi_checkout_order", { target_order_id: id });
    if (expiryError) return NextResponse.json({ error: "No se pudo actualizar la reserva del pedido." }, { status: 503, headers: { "Cache-Control": "no-store" } });
    const { data: currentOrder, error: currentOrderError } = await supabase.from("orders")
      .select("id, order_number, status, fulfillment_status, fulfillment_hold, fulfillment_hold_reason, subtotal, shipping, discount, total, currency, shipping_information, customer_email, customer_name, customer_phone, created_at, reservation_expires_at")
      .eq("id", id)
      .maybeSingle();
    if (currentOrderError || !currentOrder) return NextResponse.json({ error: "Pedido no encontrado." }, { status: 404, headers: { "Cache-Control": "no-store" } });

    const [itemsResult, paymentResult] = await Promise.all([
      supabase.from("order_items").select("id, product_name, sku, size, color, quantity, unit_price, personalization, line_total").eq("order_id", id).order("created_at"),
      supabase.from("payments").select("id, provider, transaction_id, status, amount, currency, reference, environment, created_at").eq("order_id", id).order("created_at", { ascending: false }),
    ]);
    if (itemsResult.error || paymentResult.error) {
      return NextResponse.json({ error: "No fue posible consultar el estado del pedido." }, { status: 503, headers: { "Cache-Control": "no-store" } });
    }

    return NextResponse.json({
      order: {
        id: currentOrder.id,
        number: currentOrder.order_number,
        status: currentOrder.status,
        fulfillmentStatus: currentOrder.fulfillment_status,
        fulfillmentHold: currentOrder.fulfillment_hold,
        fulfillmentHoldReason: currentOrder.fulfillment_hold_reason,
        subtotal: currentOrder.subtotal,
        shipping: currentOrder.shipping,
        discount: currentOrder.discount,
        total: currentOrder.total,
        currency: currentOrder.currency,
        shippingInformation: currentOrder.shipping_information,
        customer: { email: currentOrder.customer_email, fullName: currentOrder.customer_name, phone: currentOrder.customer_phone },
        createdAt: currentOrder.created_at,
        reservationExpiresAt: currentOrder.reservation_expires_at,
      },
      items: itemsResult.data ?? [],
      payments: paymentResult.data ?? [],
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "El estado del pedido no está disponible." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
