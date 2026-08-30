import Link from "next/link";
import { formatBDT, formatDateTime, ORDER_STATUS_FLOW } from "@/lib/utils";
import { SITE } from "@/lib/site";
import type { OrderView } from "@/lib/orders";

export type { OrderView };

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const PAYMENT_LABEL: Record<string, string> = {
  UNPAID: "Unpaid (COD)",
  PENDING_VERIFICATION: "Awaiting verification",
  PAID: "Paid",
  REFUNDED: "Refunded",
};

export function OrderDetail({
  order,
  showBanner = false,
  headingLevel = "h1",
}: {
  order: OrderView;
  showBanner?: boolean;
  /** Use "h2" when the page already has its own <h1> (e.g. /track). */
  headingLevel?: "h1" | "h2";
}) {
  const Heading = headingLevel;
  const cancelled = order.status === "CANCELLED";
  const currentStep = ORDER_STATUS_FLOW.indexOf(
    order.status as (typeof ORDER_STATUS_FLOW)[number],
  );

  return (
    <div className="space-y-8">
      {showBanner && (
        <div className="card border-gold-deep p-6">
          <p className="h-display text-2xl text-gold-deep">Thank you — order confirmed</p>
          <p className="mt-2 text-sm text-muted">
            We&apos;ve got your order <b className="text-charcoal">{order.orderNumber}</b>.
            {order.paymentMethod === "COD"
              ? " Pay cash when it's delivered."
              : " We'll verify your payment and dispatch shortly."}{" "}
            {SITE.whatsapp !== "[WHATSAPP]" && (
              <>
                Questions? WhatsApp{" "}
                <a href={`https://wa.me/${SITE.whatsapp}`} className="text-gold-deep">
                  {SITE.phone}
                </a>
                .
              </>
            )}
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <Heading className="h-display text-3xl">Order {order.orderNumber}</Heading>
          <p className="mt-1 text-xs uppercase tracking-[0.12em] text-muted-2">
            Placed {formatDateTime(order.createdAt)}
          </p>
        </div>
        <div className="flex gap-2">
          <span className="badge" style={cancelled ? { color: "#8a2f2f", borderColor: "#e0bfbf" } : { color: "#8a6516", borderColor: "#e7d3a3" }}>
            {STATUS_LABEL[order.status] ?? order.status}
          </span>
          <span className="badge">{PAYMENT_LABEL[order.paymentStatus] ?? order.paymentStatus}</span>
        </div>
      </div>

      {!cancelled && (
        <div className="flex items-center">
          {ORDER_STATUS_FLOW.map((s, i) => (
            <div key={s} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={
                    "flex h-7 w-7 items-center justify-center rounded-full border text-xs " +
                    (i <= currentStep
                      ? "border-gold-deep bg-gold text-charcoal"
                      : "border-line text-muted-2")
                  }
                >
                  {i + 1}
                </div>
                <span className="text-[10px] uppercase tracking-wide text-muted-2">{STATUS_LABEL[s]}</span>
              </div>
              {i < ORDER_STATUS_FLOW.length - 1 && (
                <div className={"mx-1 h-px flex-1 " + (i < currentStep ? "bg-gold-deep" : "bg-line")} />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <ul className="divide-y divide-line border-y border-line">
            {order.items.map((it) => (
              <li key={it.id} className="flex gap-4 py-4">
                <div className="aspect-square w-16 shrink-0 overflow-hidden rounded border border-line bg-cream-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {it.image ? <img src={it.image} alt="" className="h-full w-full object-cover" /> : null}
                </div>
                <div className="flex-1">
                  <p className="text-sm">{it.productName}</p>
                  <p className="text-xs text-muted-2">{it.size} · Qty {it.quantity}</p>
                </div>
                <p className="text-sm">{formatBDT(it.price * it.quantity)}</p>
              </li>
            ))}
          </ul>

          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-2">Subtotal</dt>
              <dd>{formatBDT(order.subtotal)}</dd>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-gold-deep">
                <dt>Discount{order.discountCode ? ` (${order.discountCode})` : ""}</dt>
                <dd>−{formatBDT(order.discountAmount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted-2">Shipping</dt>
              <dd>{order.shipping === 0 ? "Free" : formatBDT(order.shipping)}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-1.5 text-base font-semibold">
              <dt>Total</dt>
              <dd>{formatBDT(order.total)}</dd>
            </div>
          </dl>

          {order.timeline.length > 0 && (
            <div className="pt-4">
              <h3 className="label">Timeline</h3>
              <ul className="space-y-2">
                {order.timeline.map((e) => (
                  <li key={e.id} className="text-sm">
                    <span>{e.label}</span>
                    {e.note ? <span className="text-muted-2"> — {e.note}</span> : null}
                    <span className="block text-xs text-muted-2">{formatDateTime(e.createdAt)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <aside className="card h-max space-y-4 p-5 text-sm">
          <div>
            <h3 className="label">Ship to</h3>
            <p>{order.customerName}</p>
            <p className="text-muted-2">{order.phone}</p>
            <p className="text-muted-2">{order.addressLine}, {order.area}, {order.city}</p>
            {order.email ? <p className="text-muted-2">{order.email}</p> : null}
          </div>
          <div className="border-t border-line pt-4">
            <h3 className="label">Payment</h3>
            <p>{order.paymentMethod === "COD" ? "Cash on Delivery" : order.paymentMethod}</p>
            {order.transactionId ? <p className="text-muted-2">TrxID: {order.transactionId}</p> : null}
            {order.senderNumber ? <p className="text-muted-2">From: {order.senderNumber}</p> : null}
          </div>
          {(order.courier || order.trackingCode) && (
            <div className="border-t border-line pt-4">
              <h3 className="label">Shipment</h3>
              {order.courier ? <p>{order.courier}</p> : null}
              {order.trackingCode ? <p className="text-muted-2">Tracking: {order.trackingCode}</p> : null}
            </div>
          )}
          {order.note ? (
            <div className="border-t border-line pt-4">
              <h3 className="label">Note</h3>
              <p className="text-muted-2">{order.note}</p>
            </div>
          ) : null}
          <div className="border-t border-line pt-4">
            <Link href="/shop" className="btn btn-outline w-full">Continue shopping</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
