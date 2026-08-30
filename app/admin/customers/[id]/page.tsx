import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatBDT, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/admin/status-badge";
import { RoleToggle } from "@/components/admin/role-toggle";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Customer" };

export default async function CustomerDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      addresses: true,
      orders: { orderBy: { createdAt: "desc" }, include: { items: true } },
    },
  });
  if (!user) notFound();

  const spent = user.orders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((n, o) => n + o.total, 0);

  return (
    <div className="space-y-6">
      <Link
        href="/admin/customers"
        className="text-xs uppercase tracking-[0.12em] text-muted-2 hover:text-gold-deep"
      >
        ← Customers
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="h-display text-3xl">{user.name}</h1>
          <p className="mt-1 text-sm text-muted-2">
            {user.email} · {user.phone ?? "no phone"}
          </p>
          <p className="text-xs text-muted-2">
            Joined {formatDate(user.createdAt)}
          </p>
        </div>
        <RoleToggle userId={user.id} role={user.role} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Orders" value={String(user.orders.length)} />
        <Stat label="Lifetime spend" value={formatBDT(spent)} />
        <Stat label="Addresses" value={String(user.addresses.length)} />
      </div>

      {user.addresses.length > 0 && (
        <section className="card p-5 text-sm">
          <h2 className="label">Addresses</h2>
          {user.addresses.map((a) => (
            <p key={a.id} className="text-muted-2">
              {a.fullName}, {a.phone} — {a.line1}, {a.area}, {a.city}
              {a.isDefault ? (
                <span className="ml-2 text-xs text-gold-deep">default</span>
              ) : null}
            </p>
          ))}
        </section>
      )}

      <section>
        <h2 className="h-display text-xl">Orders</h2>
        <div className="card mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream-2 text-xs uppercase tracking-[0.1em] text-muted-2">
              <tr>
                <th className="p-3 text-left">Order</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Total</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {user.orders.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-muted-2">
                    No orders yet.
                  </td>
                </tr>
              )}
              {user.orders.map((o) => (
                <tr key={o.id} className="border-t border-line">
                  <td className="p-3">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="text-gold-deep hover:underline"
                    >
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td className="p-3 text-muted-2">{formatDate(o.createdAt)}</td>
                  <td className="p-3">{formatBDT(o.total)}</td>
                  <td className="p-3">
                    <StatusBadge status={o.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs uppercase tracking-[0.12em] text-muted-2">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}
