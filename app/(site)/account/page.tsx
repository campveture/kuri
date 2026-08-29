import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { signOut } from "@/app/(auth)/actions";
import { formatBDT, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/admin/status-badge";

export const metadata: Metadata = { title: "Your account — Kuri" };

export default async function AccountPage() {
  const user = await requireUser();
  const [orders, subs] = await Promise.all([
    prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { items: { select: { id: true } } },
    }),
    prisma.subscription.findMany({
      where: { userId: user.id, status: { not: "CANCELLED" } },
      orderBy: { nextShipAt: "asc" },
      include: { product: { select: { name: true } } },
    }),
  ]);

  return (
    <div className="wrap py-14">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="eyebrow mb-2">Account</div>
          <h1 className="font-serif text-[32px] font-medium sm:text-4xl">{user.name}</h1>
          <p className="mt-1 text-sm text-muted-2">{user.email}</p>
        </div>
        <div className="flex gap-3">
          {user.role === "ADMIN" && (
            <Link href="/admin" className="btn btn-outline btn-sm">Admin panel</Link>
          )}
          <form action={signOut}>
            <button className="btn btn-outline btn-sm">Sign out</button>
          </form>
        </div>
      </div>

      {subs.length > 0 && (
        <section className="mt-12">
          <h2 className="font-serif text-xl font-medium">Subscriptions</h2>
          <div className="card mt-3 divide-y divide-line">
            {subs.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-2 p-4 text-sm">
                <span>
                  {s.product.name} · {s.size} · every {s.frequencyWeeks} weeks
                </span>
                <span className="text-muted-2">Next: {formatDate(s.nextShipAt)}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-2">
            To pause or change a subscription, contact us.
          </p>
        </section>
      )}

      <section className="mt-12">
        <h2 className="font-serif text-xl font-medium">Order history</h2>
        {orders.length === 0 ? (
          <p className="mt-3 text-sm text-muted-2">
            No orders yet. <Link href="/shop" className="underline">Browse the teas →</Link>
          </p>
        ) : (
          <div className="card mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream-2 text-xs uppercase tracking-[0.1em] text-muted-2">
                <tr>
                  <th className="p-3 text-left">Order</th>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Items</th>
                  <th className="p-3 text-left">Total</th>
                  <th className="p-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t border-line">
                    <td className="p-3">
                      <Link href={`/order/${o.orderNumber}`} className="text-gold-deep hover:underline">
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td className="p-3 text-muted-2">{formatDate(o.createdAt)}</td>
                    <td className="p-3 text-muted-2">{o.items.length}</td>
                    <td className="p-3">{formatBDT(o.total)}</td>
                    <td className="p-3"><StatusBadge status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
