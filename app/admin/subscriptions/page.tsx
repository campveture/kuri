import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/admin/status-badge";
import { SubscriptionRowActions } from "@/components/admin/subscription-row-actions";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Subscriptions" };

export default async function AdminSubscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireAdmin();
  const now = new Date();
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const PAGE_SIZE = 50;

  const where: Prisma.SubscriptionWhereInput = { status: { not: "CANCELLED" } };

  const [subs, total, dueCount] = await Promise.all([
    prisma.subscription.findMany({
      where,
      orderBy: [{ nextShipAt: "asc" }],
      include: { product: { select: { name: true } } },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.subscription.count({ where }),
    prisma.subscription.count({
      where: { status: "ACTIVE", nextShipAt: { lte: now } },
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="h-display text-3xl">Subscriptions</h1>
        {dueCount > 0 && (
          <span className="badge" style={{ background: "#faf1dd", color: "#8a6516", borderColor: "#e7d3a3" }}>
            {dueCount} due now
          </span>
        )}
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-cream-2 text-xs uppercase tracking-[0.1em] text-muted-2">
            <tr>
              <th className="p-3 text-left">Tea</th>
              <th className="p-3 text-left">Weight</th>
              <th className="p-3 text-left">Frequency</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Next ship</th>
              <th className="p-3 text-left">State</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subs.length === 0 && (
              <tr>
                <td colSpan={7} className="p-4 text-muted-2">
                  No active subscriptions.
                </td>
              </tr>
            )}
            {subs.map((s) => {
              const due =
                s.status === "ACTIVE" && s.nextShipAt.getTime() <= now.getTime();
              return (
                <tr key={s.id} className="border-t border-line">
                  <td className="p-3">
                    <Link
                      href={`/admin/subscriptions/${s.id}`}
                      className="font-medium hover:text-gold-deep"
                    >
                      {s.product.name}
                    </Link>
                  </td>
                  <td className="p-3 text-muted-2">{s.size}</td>
                  <td className="p-3 text-muted-2">
                    every {s.frequencyWeeks} {s.frequencyWeeks === 1 ? "week" : "weeks"}
                  </td>
                  <td className="p-3 text-muted-2">
                    {s.customerName}
                    <span className="block text-xs">{s.phone}</span>
                  </td>
                  <td className="p-3">
                    {formatDate(s.nextShipAt)}
                    {due && (
                      <span className="ml-2 text-xs font-semibold uppercase tracking-[0.1em] text-negative">
                        Due
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <StatusBadge status={s.status} />
                  </td>
                  <td className="p-3 text-right">
                    <SubscriptionRowActions id={s.id} status={s.status} due={due} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <nav className="flex items-center justify-between text-xs text-muted-2">
          <span>
            Page {page} of {totalPages}
          </span>
          <span className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/admin/subscriptions?page=${page - 1}`}
                className="btn btn-outline btn-sm"
              >
                Prev
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/subscriptions?page=${page + 1}`}
                className="btn btn-outline btn-sm"
              >
                Next
              </Link>
            )}
          </span>
        </nav>
      )}
    </div>
  );
}
