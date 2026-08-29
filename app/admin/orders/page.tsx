import Link from "next/link";
import type { Prisma, OrderStatus, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatBDT, formatDateTime, cn } from "@/lib/utils";
import { StatusBadge } from "@/components/admin/status-badge";

export const metadata = { title: "Orders" };

const STATUS_TABS = [
  { key: "", label: "All" },
  { key: "PENDING", label: "Pending" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "PACKED", label: "Packed" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "DELIVERED", label: "Delivered" },
  { key: "CANCELLED", label: "Cancelled" },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; payment?: string; q?: string }>;
}) {
  const sp = await searchParams;

  const where: Prisma.OrderWhereInput = {};
  if (sp.status) where.status = sp.status as OrderStatus;
  if (sp.payment) where.paymentStatus = sp.payment as PaymentStatus;
  if (sp.q) {
    const q = sp.q;
    where.OR = [
      { orderNumber: { contains: q, mode: "insensitive" } },
      { customerName: { contains: q, mode: "insensitive" } },
      { phone: { contains: q } },
    ];
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { items: true },
    take: 100,
  });

  const qs = (patch: Record<string, string>) => {
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) if (v) next.set(k, v);
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    const s = next.toString();
    return s ? `/admin/orders?${s}` : "/admin/orders";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="h-display text-3xl">Orders</h1>
        <Link href="/admin/orders/new" className="btn btn-primary btn-sm">
          + New order
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {STATUS_TABS.map((t) => (
          <Link
            key={t.key}
            href={qs({ status: t.key })}
            className={cn(
              "border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em]",
              (sp.status ?? "") === t.key
                ? "border-gold-deep text-gold-deep"
                : "border-line text-muted-2 hover:border-gold-deep",
            )}
          >
            {t.label}
          </Link>
        ))}
        {sp.payment && (
          <Link
            href={qs({ payment: "" })}
            className="border border-gold-deep px-3 py-1.5 text-xs uppercase text-gold-deep"
          >
            Payment: {sp.payment.replace(/_/g, " ")} ✕
          </Link>
        )}
      </div>

      <form method="get" className="flex max-w-md gap-2">
        {sp.status ? (
          <input type="hidden" name="status" value={sp.status} />
        ) : null}
        {sp.payment ? (
          <input type="hidden" name="payment" value={sp.payment} />
        ) : null}
        <input
          name="q"
          defaultValue={sp.q}
          placeholder="Search order #, name or phone"
          className="input py-2 text-sm"
        />
        <button className="btn btn-outline btn-sm">Search</button>
      </form>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-cream-2 text-xs uppercase tracking-[0.1em] text-muted-2">
            <tr>
              <th className="p-3 text-left">Order</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Items</th>
              <th className="p-3 text-left">Total</th>
              <th className="p-3 text-left">Payment</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-2">
                  No orders match.
                </td>
              </tr>
            )}
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-line">
                <td className="p-3">
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="font-semibold text-gold-deep hover:underline"
                  >
                    {o.orderNumber}
                  </Link>
                  <span className="block text-xs text-muted-2">
                    {formatDateTime(o.createdAt)}
                  </span>
                </td>
                <td className="p-3 text-muted-2">
                  {o.customerName}
                  <span className="block text-xs">{o.phone}</span>
                </td>
                <td className="p-3 text-muted-2">
                  {o.items.reduce((n, i) => n + i.quantity, 0)}
                </td>
                <td className="p-3">{formatBDT(o.total)}</td>
                <td className="p-3">
                  <span className="text-xs text-muted-2">{o.paymentMethod}</span>
                  <span className="block">
                    <StatusBadge status={o.paymentStatus} />
                  </span>
                </td>
                <td className="p-3">
                  <StatusBadge status={o.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
