import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatBDT, formatDate } from "@/lib/utils";
import { DiscountRowActions } from "@/components/admin/discount-row-actions";

export const metadata = { title: "Discounts" };

export default async function AdminDiscountsPage() {
  const discounts = await prisma.discount.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="h-display text-3xl">Discount codes</h1>
        <Link href="/admin/discounts/new" className="btn btn-primary btn-sm">
          + New discount
        </Link>
      </div>

      {discounts.length === 0 ? (
        <div className="card p-10 text-center text-sm text-muted-2">
          No discount codes yet.{" "}
          <Link href="/admin/discounts/new" className="text-gold-deep">
            Create one →
          </Link>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream-2 text-xs uppercase tracking-[0.1em] text-muted-2">
              <tr>
                <th className="p-3 text-left">Code</th>
                <th className="p-3 text-left">Value</th>
                <th className="p-3 text-left">Min order</th>
                <th className="p-3 text-left">Uses</th>
                <th className="p-3 text-left">Window</th>
                <th className="p-3 text-left">State</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {discounts.map((d) => {
                const expired = d.endsAt && d.endsAt < new Date();
                return (
                  <tr key={d.id} className="border-t border-line">
                    <td className="p-3 font-semibold">{d.code}</td>
                    <td className="p-3 text-muted-2">
                      {d.type === "PERCENT" ? `${d.value}%` : formatBDT(d.value)}
                    </td>
                    <td className="p-3 text-muted-2">
                      {d.minSubtotal > 0 ? formatBDT(d.minSubtotal) : "—"}
                    </td>
                    <td className="p-3 text-muted-2">
                      {d.usedCount}
                      {d.maxUses != null ? ` / ${d.maxUses}` : ""}
                    </td>
                    <td className="p-3 text-xs text-muted-2">
                      {d.startsAt ? formatDate(d.startsAt) : "—"} →{" "}
                      {d.endsAt ? formatDate(d.endsAt) : "—"}
                    </td>
                    <td className="p-3">
                      <span
                        className={
                          expired
                            ? "badge border-[#b03636]/40 text-negative"
                            : d.active
                              ? "badge border-[#3f5c43]/40 text-positive"
                              : "badge border-line text-muted-2"
                        }
                      >
                        {expired ? "Expired" : d.active ? "Active" : "Off"}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <DiscountRowActions id={d.id} active={d.active} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
