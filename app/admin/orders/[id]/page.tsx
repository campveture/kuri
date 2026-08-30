import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatBDT, formatDateTime } from "@/lib/utils";
import { StatusBadge } from "@/components/admin/status-badge";
import { OrderControls } from "@/components/admin/order-controls";
import { FulfillmentControls } from "@/components/admin/fulfillment-controls";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Order" };

export default async function AdminOrderDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      timeline: { orderBy: { createdAt: "asc" } },
      user: { select: { id: true, name: true, email: true } },
    },
  });
  if (!order) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/admin/orders"
        className="text-xs uppercase tracking-[0.12em] text-muted-2 hover:text-gold-deep"
      >
        ← All orders
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="h-display text-3xl">{order.orderNumber}</h1>
          <p className="mt-1 text-xs uppercase tracking-[0.12em] text-muted-2">
            {formatDateTime(order.createdAt)}
          </p>
        </div>
        <div className="flex gap-2">
          <StatusBadge status={order.status} />
          <StatusBadge status={order.paymentStatus} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream-2 text-xs uppercase tracking-[0.1em] text-muted-2">
                <tr>
                  <th className="p-3 text-left">Item</th>
                  <th className="p-3 text-left">Weight</th>
                  <th className="p-3 text-left">Qty</th>
                  <th className="p-3 text-right">Line</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((it) => (
                  <tr key={it.id} className="border-t border-line">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded border border-line bg-cream-2">
                          {it.image ? (
                            // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail, remote URL
                            <img
                              src={it.image}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                        </div>
                        <span>{it.productName}</span>
                      </div>
                    </td>
                    <td className="p-3 text-muted-2">{it.size}</td>
                    <td className="p-3 text-muted-2">{it.quantity}</td>
                    <td className="p-3 text-right">
                      {formatBDT(it.price * it.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-line text-sm">
                <tr>
                  <td colSpan={3} className="p-3 text-right text-muted-2">
                    Subtotal
                  </td>
                  <td className="p-3 text-right">{formatBDT(order.subtotal)}</td>
                </tr>
                {order.discountAmount > 0 && (
                  <tr className="text-gold-deep">
                    <td colSpan={3} className="p-3 text-right">
                      Discount
                      {order.discountCode ? ` (${order.discountCode})` : ""}
                    </td>
                    <td className="p-3 text-right">
                      −{formatBDT(order.discountAmount)}
                    </td>
                  </tr>
                )}
                <tr>
                  <td colSpan={3} className="p-3 text-right text-muted-2">
                    Shipping
                  </td>
                  <td className="p-3 text-right">
                    {order.shipping === 0 ? "Free" : formatBDT(order.shipping)}
                  </td>
                </tr>
                <tr className="border-t border-line font-semibold">
                  <td colSpan={3} className="p-3 text-right">
                    Total
                  </td>
                  <td className="p-3 text-right">{formatBDT(order.total)}</td>
                </tr>
              </tfoot>
            </table>
          </section>

          <section className="card p-5">
            <h2 className="label">Timeline</h2>
            <ul className="mt-2 space-y-2 text-sm">
              {order.timeline.length === 0 && (
                <li className="text-muted-2">No events yet.</li>
              )}
              {order.timeline.map((e) => (
                <li key={e.id}>
                  <span>{e.label}</span>
                  {e.note ? (
                    <span className="text-muted-2"> — {e.note}</span>
                  ) : null}
                  <span className="block text-xs text-muted-2">
                    {formatDateTime(e.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="space-y-6">
          <section className="card p-5 text-sm">
            <h2 className="label">Customer</h2>
            <p>{order.customerName}</p>
            <p className="text-muted-2">{order.phone}</p>
            {order.email ? (
              <p className="text-muted-2">{order.email}</p>
            ) : null}
            <p className="mt-2 text-muted-2">
              {order.addressLine}, {order.area}, {order.city}
            </p>
            {order.user ? (
              <p className="mt-2 text-xs text-muted-2">
                Registered account · {order.user.email}
              </p>
            ) : (
              <p className="mt-2 text-xs text-muted-2">Guest checkout</p>
            )}
            {order.note ? (
              <p className="mt-3 border-t border-line pt-3 text-muted-2">
                <span className="text-charcoal">Note:</span> {order.note}
              </p>
            ) : null}
          </section>

          <section className="card p-5 text-sm">
            <h2 className="label">Payment</h2>
            <p>{order.paymentMethod}</p>
            {order.transactionId ? (
              <p className="text-muted-2">TrxID: {order.transactionId}</p>
            ) : null}
            {order.senderNumber ? (
              <p className="text-muted-2">From: {order.senderNumber}</p>
            ) : null}
          </section>

          <OrderControls
            orderId={order.id}
            status={order.status}
            paymentStatus={order.paymentStatus}
          />

          <FulfillmentControls
            orderId={order.id}
            courier={order.courier}
            trackingCode={order.trackingCode}
          />
        </div>
      </div>
    </div>
  );
}
