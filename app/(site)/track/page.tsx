import type { Metadata } from "next";
import { findOrderByNumberAndPhone } from "@/lib/orders";
import { OrderDetail } from "@/components/shop/order-detail";

export const metadata: Metadata = { title: "Track your order — Kuri" };

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; phone?: string }>;
}) {
  const { order: orderNumber, phone } = await searchParams;
  const order =
    orderNumber && phone ? await findOrderByNumberAndPhone(orderNumber, phone) : null;
  const searched = Boolean(orderNumber && phone);

  return (
    <div className="wrap py-16">
      <div className="eyebrow mb-3">Track</div>
      <h1 className="font-serif text-[32px] font-medium sm:text-4xl">Track your order</h1>
      <p className="mt-2 text-sm text-muted">
        Enter your order number and the phone number used at checkout.
      </p>

      <form method="get" className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
        <input name="order" defaultValue={orderNumber} placeholder="KV-26-XXXXX" className="input" required />
        <input name="phone" defaultValue={phone} placeholder="Phone number" className="input" required />
        <button className="btn btn-primary shrink-0">Track</button>
      </form>

      {searched && !order && (
        <p className="mt-8 border border-[#b03636]/40 bg-[#b03636]/10 px-4 py-3 text-sm text-negative">
          No order found with that number and phone. Double-check both.
        </p>
      )}

      {order && (
        <div className="mt-10">
          <OrderDetail order={order} headingLevel="h2" />
        </div>
      )}
    </div>
  );
}
