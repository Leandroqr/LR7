import { OrderStatusClient } from "@/components/commerce/order-status-client";

export const metadata = {
  robots: { index: false, follow: false },
};

type OrderStatusPageProps = Readonly<{
  params: Promise<{ id: string }>;
  searchParams: Promise<{ id?: string | string[] }>;
}>;

export default async function OrderStatusPage({ params, searchParams }: OrderStatusPageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const transactionId = typeof query.id === "string" && /^[A-Za-z0-9-]{1,128}$/.test(query.id)
    ? query.id
    : null;
  return <OrderStatusClient orderId={id} transactionId={transactionId} />;
}
