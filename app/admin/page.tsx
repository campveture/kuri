import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { formatBDT, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/admin/status-badge";

export default async function AdminDashboard() {
  await requireAdmin();
  // eslint-disable-next-line react-hooks/purity -- RSC render is request-scoped, not memoised
  const now = Date.now();
  const [
    orders,
    pendingCount,
    awaitingPayment,
    allTimeAgg,
    monthAgg,
    lowStock,
    customerCount,
    dueSubs,
    unreadMessages,
    recent,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { paymentStatus: "PENDING_VERIFICATION" } }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { not: "CANCELLED" } },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        status: { not: "CANCELLED" },
        createdAt: { gte: new Date(now - 30 * 86400000) },
      },
    }),
    prisma.productVariant.findMany({
      where: { stock: { lte: 3 } },
      include: { product: { select: { name: true, id: true } } },
      orderBy: { stock: "asc" },
      take: 8,
    }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.subscription.count({
      where: { status: "ACTIVE", nextShipAt: { lte: new Date(now) } },
    }),
    prisma.contactMessage.count({ where: { handled: false } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const stats = [
    { label: "Revenue (all-time)", value: formatBDT(allTimeAgg._sum.total ?? 0) },
    { label: "Revenue (30 days)", value: formatBDT(monthAgg._sum.total ?? 0) },
    { label: "Orders", value: String(orders) },
    { label: "Customers", value: String(customerCount) },
  ];

  const quick = [
    { label: "Pending orders", value: pendingCount, href: "/admin/orders?status=PENDING" },
    { label: "Payments to verify", value: awaitingPayment, href: "/admin/orders?payment=PENDING_VERIFICATION" },
    { label: "Subscriptions due", value: dueSubs, href: "/admin/subscriptions" },
    { label: "Unread messages", value: unreadMessages, href: "/admin/messages" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="h-display text-3xl">Dashboard</h1>
        <Link href="/admin/products/new" className="btn btn-primary btn-sm">
          + New tea
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <p className="text-xs uppercase tracking-[0.12em] text-muted-2">{s.label}</p>
            <p className="mt-2 text-2xl font-semibold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quick.map((q) => (
          <Link key={q.label} href={q.href} className="card p-5 transition-colors hover:border-gold-deep">
            <p className="text-xs uppercase tracking-[0.12em] text-muted-2">{q.label}</p>
            <p className="mt-2 text-2xl font-semibold text-gold-deep">{q.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <section>
          <div className="flex items-center justify-between">
            <h2 className="h-display text-xl">Recent orders</h2>
            <Link href="/admin/orders" className="text-xs uppercase tracking-[0.12em] text-gold-deep">
              All orders →
            </Link>
          </div>
          <div className="card mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream-2 text-xs uppercase tracking-[0.1em] text-muted-2">
                <tr>
                  <th className="p-3 text-left">Order</th>
                  <th className="p-3 text-left">Customer</th>
                  <th className="p-3 text-left">Total</th>
                  <th className="p-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-4 text-muted-2">No orders yet.</td>
                  </tr>
                )}
                {recent.map((o) => (
                  <tr key={o.id} className="border-t border-line">
                    <td className="p-3">
                      <Link href={`/admin/orders/${o.id}`} className="text-gold-deep hover:underline">
                        {o.orderNumber}
                      </Link>
                      <span className="block text-xs text-muted-2">{formatDate(o.createdAt)}</span>
                    </td>
                    <td className="p-3 text-muted">{o.customerName}</td>
                    <td className="p-3">{formatBDT(o.total)}</td>
                    <td className="p-3"><StatusBadge status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="h-display text-xl">Low stock</h2>
          <div className="mt-3 space-y-2">
            {lowStock.length === 0 && (
              <p className="card p-4 text-sm text-muted-2">Everything well stocked.</p>
            )}
            {lowStock.map((v) => (
              <Link
                key={v.id}
                href={`/admin/products/${v.product.id}`}
                className="card flex items-center justify-between p-3 text-sm transition-colors hover:border-gold-deep"
              >
                <span>
                  {v.product.name} <span className="text-muted-2">· {v.size}</span>
                </span>
                <span className={v.stock === 0 ? "text-negative" : "text-gold-deep"}>
                  {v.stock} left
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
