import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatBDT, formatDate } from "@/lib/utils";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Customers" };

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const PAGE_SIZE = 50;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        orders: { select: { total: true, status: true } },
      },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.user.count(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="h-display text-3xl">Customers</h1>
        <Link href="/admin/customers/new" className="btn btn-primary btn-sm">
          + New user
        </Link>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-cream-2 text-xs uppercase tracking-[0.1em] text-muted-2">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Contact</th>
              <th className="p-3 text-left">Orders</th>
              <th className="p-3 text-left">Spent</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-muted-2">
                  No customers yet.
                </td>
              </tr>
            )}
            {users.map((u) => {
              const spent = u.orders
                .filter((o) => o.status !== "CANCELLED")
                .reduce((n, o) => n + o.total, 0);
              return (
                <tr key={u.id} className="border-t border-line">
                  <td className="p-3">
                    <Link
                      href={`/admin/customers/${u.id}`}
                      className="text-gold-deep hover:underline"
                    >
                      {u.name}
                    </Link>
                  </td>
                  <td className="p-3 text-muted-2">
                    {u.email}
                    <span className="block text-xs">{u.phone}</span>
                  </td>
                  <td className="p-3 text-muted-2">{u.orders.length}</td>
                  <td className="p-3">{formatBDT(spent)}</td>
                  <td className="p-3">
                    <span
                      className={
                        u.role === "ADMIN"
                          ? "badge border-gold-deep text-gold-deep"
                          : "badge border-line text-muted-2"
                      }
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 text-muted-2">{formatDate(u.createdAt)}</td>
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
                href={`/admin/customers?page=${page - 1}`}
                className="btn btn-outline btn-sm"
              >
                Prev
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/customers?page=${page + 1}`}
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
