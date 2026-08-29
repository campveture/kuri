import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatBDT, formatDate, formatDateTime } from "@/lib/utils";
import { StatusBadge } from "@/components/admin/status-badge";
import { SubscriptionRowActions } from "@/components/admin/subscription-row-actions";
import { SubscriptionEditForm } from "@/components/admin/subscription-edit-form";

export const metadata = { title: "Subscription" };

export default async function AdminSubscriptionDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sub = await prisma.subscription.findUnique({
    where: { id },
    include: {
      product: { include: { variants: { orderBy: { size: "asc" } } } },
      orders: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!sub) notFound();

  const now = new Date();
  const due =
    sub.status === "ACTIVE" && sub.nextShipAt.getTime() <= now.getTime();
  const nextShipDate = sub.nextShipAt.toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <Link
        href="/admin/subscriptions"
        className="text-xs uppercase tracking-[0.12em] text-muted-2 hover:text-gold-deep"
      >
        ← All subscriptions
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="h-display text-3xl">{sub.product.name}</h1>
          <p className="mt-1 text-xs uppercase tracking-[0.12em] text-muted-2">
            {sub.size} · every {sub.frequencyWeeks}{" "}
            {sub.frequencyWeeks === 1 ? "week" : "weeks"} · started{" "}
            {formatDate(sub.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={sub.status} />
          {due && (
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-negative">
              Due now
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className="card p-5 text-sm">
            <h2 className="label">Schedule</h2>
            <p>
              Next ship date: <span className="font-medium">{formatDate(sub.nextShipAt)}</span>
            </p>
            <p className="text-muted-2">
              Price locked at signup: {formatBDT(sub.priceAtSignup)}
            </p>
            {sub.lastOrderId && (
              <p className="mt-1 text-xs text-muted-2">
                Last generated order:{" "}
                <Link
                  href={`/admin/orders/${sub.lastOrderId}`}
                  className="text-gold-deep hover:underline"
                >
                  view ↗
                </Link>
              </p>
            )}
          </section>

          <section className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream-2 text-xs uppercase tracking-[0.1em] text-muted-2">
                <tr>
                  <th className="p-3 text-left">Order</th>
                  <th className="p-3 text-left">Placed</th>
                  <th className="p-3 text-left">Total</th>
                  <th className="p-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {sub.orders.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-4 text-muted-2">
                      No orders generated yet.
                    </td>
                  </tr>
                )}
                {sub.orders.map((o) => (
                  <tr key={o.id} className="border-t border-line">
                    <td className="p-3">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="font-semibold text-gold-deep hover:underline"
                      >
                        {o.orderNumber}
                      </Link>
                      {o.isSubscriptionSeed && (
                        <span className="ml-2 text-xs text-muted-2">seed</span>
                      )}
                    </td>
                    <td className="p-3 text-muted-2">
                      {formatDateTime(o.createdAt)}
                    </td>
                    <td className="p-3">{formatBDT(o.total)}</td>
                    <td className="p-3">
                      <StatusBadge status={o.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <SubscriptionEditForm
            id={sub.id}
            frequencyWeeks={sub.frequencyWeeks}
            nextShipAt={nextShipDate}
            variantId={sub.variantId}
            size={sub.size}
            variants={sub.product.variants.map((v) => ({
              id: v.id,
              size: v.size,
              stock: v.stock,
            }))}
          />
        </div>

        <div className="space-y-6">
          <section className="card p-5 text-sm">
            <h2 className="label">Customer</h2>
            <p>{sub.customerName}</p>
            <p className="text-muted-2">{sub.phone}</p>
            {sub.email && <p className="text-muted-2">{sub.email}</p>}
            <p className="mt-2 text-muted-2">
              {sub.addressLine}, {sub.area}, {sub.city}
            </p>
          </section>

          <section className="card p-5">
            <h2 className="label">Actions</h2>
            <div className="mt-2">
              <SubscriptionRowActions
                id={sub.id}
                status={sub.status}
                due={due}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
