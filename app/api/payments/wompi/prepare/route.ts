import { createHash, createHmac } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { readLimitedRequestBody, RequestBodyTooLargeError } from "@/lib/http/read-limited-request-body";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrderAccessCookieName, matchesOrderAccessToken } from "@/lib/payments/order-access";
import { isOrderOwnedByUser } from "@/lib/payments/order-ownership";
import { createWompiIntegritySignature, getWompiConfig } from "@/lib/payments/wompi";

export const runtime = "nodejs";

const checkoutRequestSchema = z.object({
  idempotencyKey: z.uuid(),
  attemptKey: z.uuid(),
  items: z.array(z.object({
    sku: z.string().trim().min(2).max(100),
    quantity: z.number().int().min(1).max(5),
    personalization: z.object({
      enabled: z.boolean(),
      name: z.string().max(12).optional(),
      number: z.string().max(2).optional(),
    }).optional(),
  })).min(1).max(20),
  customer: z.object({ email: z.email().trim().max(254), fullName: z.string().trim().min(2).max(160), phone: z.string().trim().regex(/^\d{10}$/) }),
  shipping: z.object({
    addressLine1: z.string().trim().min(5).max(180),
    addressLine2: z.string().trim().max(180).optional().default(""),
    city: z.string().trim().min(2).max(100),
    region: z.string().trim().min(2).max(100),
    postalCode: z.string().trim().max(20).optional().default(""),
  }),
  couponCode: z.string().trim().max(80).optional().default(""),
});

const retryRequestSchema = z.object({ retryOrderId: z.uuid(), attemptKey: z.uuid() });

function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

function getCheckoutSiteUrl(request: Request) {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  try {
    const value = configuredUrl || (process.env.NODE_ENV === "development" ? request.url : "");
    const siteUrl = new URL(value);
    const localDevelopment = process.env.NODE_ENV === "development" && ["localhost", "127.0.0.1"].includes(siteUrl.hostname);
    if (siteUrl.username || siteUrl.password || (siteUrl.protocol !== "https:" && !(localDevelopment && siteUrl.protocol === "http:"))) return null;
    return new URL(siteUrl.origin);
  } catch {
    return null;
  }
}

function checkoutError(message: string) {
  const mappings = [
    { codes: ["checkout_variant_unavailable"], status: 409, message: "Una variante del carrito ya no está disponible." },
    { codes: ["checkout_stock_unavailable"], status: 409, message: "No hay stock suficiente para completar el pedido." },
    { codes: ["checkout_coupon_invalid", "checkout_coupon_unavailable"], status: 400, message: "El cupón no está disponible para este pedido." },
    { codes: ["checkout_attempt_pending"], status: 409, message: "Ya hay un intento de pago en curso para este pedido. Consulta su estado antes de reintentar." },
    { codes: ["checkout_shipping_not_configured"], status: 503, message: "El costo de envío aún no está configurado." },
    { codes: ["checkout_idempotency_conflict"], status: 409, message: "Este pedido ya se inició con otros datos. Recupera el pedido existente o inicia un checkout nuevo cuando expire." },
    { codes: ["checkout_personalization"], status: 400, message: "Revisa los datos de personalización." },
    { codes: ["checkout_quantity", "checkout_cart"], status: 400, message: "Revisa los productos y cantidades del carrito." },
    { codes: ["checkout_line_total", "checkout_total"], status: 400, message: "El importe del pedido excede los límites permitidos." },
    { codes: ["checkout_customer_data"], status: 400, message: "Revisa los datos de entrega." },
  ];
  const match = mappings.find(({ codes }) => codes.some((code) => message.includes(code)));
  return match ?? { status: 503, message: "No fue posible preparar el pedido. Inténtalo nuevamente." };
}

function getExistingOrderMessage(status: unknown) {
  if (status === "paid") return "Este pedido ya está pagado.";
  if (status === "refunded") return "Este pedido ya fue reembolsado.";
  return "La reserva expiró o el pedido fue cancelado.";
}

function preparedResponse(
  request: Request,
  siteUrl: URL,
  config: NonNullable<ReturnType<typeof getWompiConfig>>,
  value: unknown,
  accessToken: string,
  customer: { email: string; fullName: string; phone: string },
  shipping: { addressLine1: string; addressLine2?: string; city: string; region: string },
) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return NextResponse.json({ error: "No fue posible preparar el pedido." }, { status: 503 });
  const order = value as Record<string, unknown>;
  if (["expired", "paid", "refunded", "cancelled"].includes(String(order.status)) && typeof order.order_id === "string") {
    return orderStatusResponse(request, order.order_id, accessToken, getExistingOrderMessage(order.status));
  }
  if (typeof order.order_id !== "string" || typeof order.order_number !== "string" || typeof order.total !== "number" || typeof order.reference !== "string") {
    return NextResponse.json({ error: "La respuesta de checkout está incompleta." }, { status: 503 });
  }
  const amountInCents = order.total * 100;
  if (!Number.isSafeInteger(amountInCents) || amountInCents <= 0) return NextResponse.json({ error: "El total del pedido no es válido." }, { status: 409 });

  const redirectUrl = new URL(`/checkout/estado/${order.order_id}`, siteUrl).toString();
  const response = NextResponse.json({
    order: {
      id: order.order_id, number: order.order_number, status: order.status,
      subtotal: order.subtotal, shipping: order.shipping, discount: order.discount,
      total: order.total, currency: order.currency, reservationExpiresAt: order.reservation_expires_at,
    },
    checkout: {
      publicKey: config.publicKey, reference: order.reference, amountInCents, currency: "COP",
      signature: createWompiIntegritySignature(order.reference, amountInCents, "COP", config.integritySecret),
      redirectUrl,
      customerData: { email: customer.email, fullName: customer.fullName, phoneNumber: customer.phone, phoneNumberPrefix: "+57" },
      shippingAddress: {
        addressLine1: shipping.addressLine1, addressLine2: shipping.addressLine2 || undefined,
        city: shipping.city, region: shipping.region, country: "CO",
        phoneNumber: customer.phone, name: customer.fullName,
      },
    },
  });
  response.cookies.set(`lr7_order_${order.order_id}`, accessToken, {
    httpOnly: true, sameSite: "lax", secure: new URL(request.url).protocol === "https:",
    path: "/", maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}

function orderStatusResponse(request: Request, orderId: string, accessToken: string, error: string) {
  const response = NextResponse.json({ error, resumeOrderId: orderId }, { status: 409 });
  response.cookies.set(`lr7_order_${orderId}`, accessToken, {
    httpOnly: true, sameSite: "lax", secure: new URL(request.url).protocol === "https:",
    path: "/", maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}

async function retryExistingOrder(request: Request, siteUrl: URL, retryOrderId: string, attemptKey: string, config: NonNullable<ReturnType<typeof getWompiConfig>>, accessSecret: string) {
  const cookieName = getOrderAccessCookieName(retryOrderId);
  if (!cookieName) return NextResponse.json({ error: "Pedido no encontrado." }, { status: 404 });
  const [cookieStore, sessionClient] = await Promise.all([cookies(), createSupabaseServerClient()]);
  if (!sessionClient) return NextResponse.json({ error: "Supabase no está configurado." }, { status: 503 });
  const { data: { user } } = await sessionClient.auth.getUser();
  const admin = createSupabaseAdminClient();
  const { data: order, error } = await admin.from("orders")
    .select("id, user_id, checkout_idempotency_key, checkout_payload_hash, public_access_token_hash, customer_email, customer_name, customer_phone, shipping_information, status")
    .eq("id", retryOrderId)
    .maybeSingle();
  if (error || !order) return NextResponse.json({ error: "Pedido no encontrado." }, { status: 404 });
  const accessToken = cookieStore.get(cookieName)?.value ?? "";
  const isOwner = user?.id === order.user_id && order.user_id !== null;
  if (!isOwner && !matchesOrderAccessToken(accessToken, order.public_access_token_hash)) {
    return NextResponse.json({ error: "Pedido no encontrado." }, { status: 404 });
  }
  if (!order.checkout_idempotency_key || !order.checkout_payload_hash) {
    return NextResponse.json({ error: "Este pedido no admite otro intento de pago." }, { status: 409 });
  }
  const retryToken = createHmac("sha256", accessSecret).update(order.checkout_idempotency_key).digest("hex");
  if (["paid", "refunded", "cancelled"].includes(order.status)) {
    return orderStatusResponse(request, order.id, retryToken, order.status === "paid" ? "Este pedido ya está pagado." : "Este pedido ya no admite pagos.");
  }
  const { data: items, error: itemsError } = await admin.from("order_items")
    .select("sku, quantity, personalization")
    .eq("order_id", retryOrderId);
  if (itemsError || !items?.length) return NextResponse.json({ error: "No fue posible recuperar los artículos del pedido." }, { status: 503 });

  const shippingInformation = order.shipping_information as Record<string, string>;
  const retry = await admin.rpc("start_wompi_checkout", {
    p_idempotency_key: order.checkout_idempotency_key,
    p_payload_hash: order.checkout_payload_hash,
    p_access_token_hash: createHash("sha256").update(retryToken).digest("hex"),
    p_attempt_idempotency_key: attemptKey,
    p_user_id: order.user_id,
    p_customer_email: order.customer_email,
    p_customer_name: order.customer_name,
    p_customer_phone: order.customer_phone ?? "",
    p_shipping_information: order.shipping_information,
    p_items: items.map((item) => {
      const personalization = item.personalization as { name?: string; number?: string };
      const enabled = Boolean(personalization.name || personalization.number);
      return { sku: item.sku, quantity: item.quantity, personalization: { enabled, name: personalization.name ?? "", number: personalization.number ?? "" } };
    }),
    p_coupon_code: null,
    p_environment: config.environment,
  });
  if (retry.error) {
    const mapped = checkoutError(retry.error.message);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
  return preparedResponse(request, siteUrl, config, retry.data, retryToken, {
    email: order.customer_email,
    fullName: order.customer_name,
    phone: order.customer_phone ?? "",
  }, {
    addressLine1: shippingInformation.address_line_1 ?? "",
    addressLine2: shippingInformation.address_line_2 ?? "",
    city: shippingInformation.city ?? "",
    region: shippingInformation.department ?? "",
  });
}

async function createNewOrder(request: Request, siteUrl: URL, input: z.infer<typeof checkoutRequestSchema>, config: NonNullable<ReturnType<typeof getWompiConfig>>, accessSecret: string) {
  let user: { id: string } | null = null;
  try {
    const authClient = await createSupabaseServerClient();
    if (!authClient) return NextResponse.json({ error: "Supabase no está configurado." }, { status: 503 });
    const { data } = await authClient.auth.getUser();
    user = data.user;
  } catch {
    return NextResponse.json({ error: "No se pudo validar la sesión." }, { status: 503 });
  }
  const accessToken = createHmac("sha256", accessSecret).update(input.idempotencyKey).digest("hex");
  const accessTokenHash = createHash("sha256").update(accessToken).digest("hex");
  const shippingInformation = {
    address_line_1: input.shipping.addressLine1,
    address_line_2: input.shipping.addressLine2,
    city: input.shipping.city,
    department: input.shipping.region,
    postal_code: input.shipping.postalCode,
    country: "CO",
  };
  const payloadHash = createHash("sha256").update(JSON.stringify({
    items: input.items,
    couponCode: input.couponCode,
    customer: input.customer,
    shipping: input.shipping,
  })).digest("hex");

  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin.rpc("start_wompi_checkout", {
      p_idempotency_key: input.idempotencyKey,
      p_payload_hash: payloadHash,
      p_access_token_hash: accessTokenHash,
      p_attempt_idempotency_key: input.attemptKey,
      p_user_id: user?.id ?? null,
      p_customer_email: input.customer.email,
      p_customer_name: input.customer.fullName,
      p_customer_phone: input.customer.phone,
      p_shipping_information: shippingInformation,
      p_items: input.items,
      p_coupon_code: input.couponCode || null,
      p_environment: config.environment,
    });
    if (error) {
      const mapped = checkoutError(error.message);
      if (error.message.includes("checkout_idempotency_conflict")) {
        const { data: existingOrder } = await admin.from("orders")
          .select("id, user_id, public_access_token_hash")
          .eq("checkout_idempotency_key", input.idempotencyKey)
          .maybeSingle();
        const ownsOrder = existingOrder && isOrderOwnedByUser(existingOrder.user_id, user?.id ?? null);
        const hasGuestAccess = existingOrder && matchesOrderAccessToken(accessToken, existingOrder.public_access_token_hash);
        if (existingOrder && (ownsOrder || hasGuestAccess)) {
          const response = NextResponse.json({ error: mapped.message, resumeOrderId: existingOrder.id }, { status: 409 });
          response.cookies.set(`lr7_order_${existingOrder.id}`, accessToken, {
            httpOnly: true, sameSite: "lax", secure: new URL(request.url).protocol === "https:",
            path: "/", maxAge: 60 * 60 * 24 * 30,
          });
          return response;
        }
      }
      return NextResponse.json({ error: mapped.message }, { status: mapped.status });
    }
    return preparedResponse(request, siteUrl, config, data, accessToken, input.customer, input.shipping);
  } catch {
    return NextResponse.json({ error: "No fue posible preparar el pedido en este momento." }, { status: 503 });
  }
}

async function readCheckoutRequest(request: Request) {
  try {
    const rawBody = await readLimitedRequestBody(request, 32768);
    return { value: JSON.parse(rawBody) as unknown };
  } catch (error) {
    const status = error instanceof RequestBodyTooLargeError ? 413 : 400;
    return { response: NextResponse.json({ error: status === 413 ? "La solicitud excede el tamaño permitido." : "El cuerpo JSON no es válido." }, { status }) };
  }
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Origen no permitido." }, { status: 403 });
  if (process.env.WOMPI_CHECKOUT_ENABLED !== "true") {
    return NextResponse.json({ error: "El checkout Wompi aún no está habilitado." }, { status: 503 });
  }
  const config = getWompiConfig();
  const accessSecret = process.env.CHECKOUT_ACCESS_SECRET?.trim() ?? "";
  if (!config || accessSecret.length < 32) return NextResponse.json({ error: "El checkout no está configurado completamente." }, { status: 503 });
  const siteUrl = getCheckoutSiteUrl(request);
  if (!siteUrl) return NextResponse.json({ error: "Falta configurar la URL pública HTTPS del checkout." }, { status: 503 });
  const requestBody = await readCheckoutRequest(request);
  if ("response" in requestBody) return requestBody.response;
  const body = requestBody.value;
  const retryRequest = retryRequestSchema.safeParse(body);
  if (retryRequest.success) {
    try {
      return await retryExistingOrder(request, siteUrl, retryRequest.data.retryOrderId, retryRequest.data.attemptKey, config, accessSecret);
    } catch {
      return NextResponse.json({ error: "No fue posible reintentar el pago." }, { status: 503 });
    }
  }
  const parsed = checkoutRequestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Revisa el carrito y los datos de entrega." }, { status: 400 });

  return createNewOrder(request, siteUrl, parsed.data, config, accessSecret);
}