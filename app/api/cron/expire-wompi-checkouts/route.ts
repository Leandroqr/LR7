import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function hasValidCronSecret(request: Request) {
  const secret = process.env.CRON_SECRET?.trim() ?? "";
  const authorization = request.headers.get("authorization") ?? "";
  if (secret.length < 32 || !authorization.startsWith("Bearer ")) return false;
  const supplied = Buffer.from(authorization.slice(7));
  const expected = Buffer.from(secret);
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

export async function GET(request: Request) {
  if (!hasValidCronSecret(request)) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.rpc("expire_wompi_checkout_reservations", { batch_size: 100 });
    if (error) return NextResponse.json({ error: "No se pudieron expirar reservas." }, { status: 503 });
    return NextResponse.json({ expired: data }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "El servicio de expiración no está disponible." }, { status: 503 });
  }
}
