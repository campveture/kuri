import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getErpReport } from "@/lib/erp";
import { formatBDT } from "@/lib/utils";
import { StoreRowActions } from "@/components/admin/store-row-actions";

export const metadata = { title: "Stores & stock" };

const TOOLS = [
  { href: "/admin/stores/sell", label: "Record a sale", hint: "Ring up a walk-in / counter sale" },
  { href: "/admin/stores/inventory", label: "Inventory", hint: "Stock per store, adjustments & transfers" },
  { href: "/admin/stores/expenses", label: "Expenses", hint: "Rent, salary, marketing, restock costs" },
  { href: "/admin/stores/reports", label: "Profit & loss", hint: "Revenue, COGS, expenses, net — per store" },
];

export default async function StoresHub() {
  const to = new Date();
  const from = new Date(to.getTime() - 29 * 86400000);
  const [locations, report] = await Promise.all([
    prisma.location.findMany({
      orderBy: [{ kind: "asc" }, { position: "asc" }, { createdAt: "asc" }],
      include: { _count: { select: { sales: true } } },
    }),
    getErpReport(from, to),
  ]);

  const t = report.totals;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="h-display text-3xl">Stores &amp; stock</h1>
        <p className="mt-1 text-sm text-muted-2">
          Run Kuri&rsquo;s physical shops alongside the website — one stock count,
          one profit picture.
        </p>
      </div>

      {/* 30-day KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { k: "Revenue (30d)", v: formatBDT(t.revenue) },
          { k: "Gross profit", v: formatBDT(t.grossProfit) },
          { k: "Net profit", v: formatBDT(t.netProfit) },
          { k: "Stock value", v: formatBDT(t.stockValue) },
        ].map((c) => (
          <div key={c.k} className="card p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-2">{c.k}</p>
            <p className="mt-1 text-2xl font-semibold">{c.v}</p>
          </div>
        ))}
      </div>

      {/* tools */}
      <div className="grid gap-3 sm:grid-cols-2">
        {TOOLS.map((x) => (
          <Link
            key={x.href}
            href={x.href}
            className="card flex items-center justify-between p-5 transition-colors hover:border-gold-deep"
          >
            <div>
              <p className="h-display text-lg">{x.label}</p>
              <p className="text-xs text-muted-2">{x.hint}</p>
            </div>
            <span className="text-gold-deep">→</span>
          </Link>
        ))}
      </div>

      {/* locations */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="h-display text-xl">Locations</h2>
          <Link href="/admin/stores/new" className="btn btn-primary btn-sm">
            + New store
          </Link>
        </div>
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream-2 text-xs uppercase tracking-[0.1em] text-muted-2">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Address</th>
                <th className="p-3 text-left">Sales</th>
                <th className="p-3 text-left">State</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((l) => (
                <tr key={l.id} className="border-t border-line">
                  <td className="p-3">
                    {l.kind === "ONLINE" ? (
                      l.name
                    ) : (
                      <Link
                        href={`/admin/stores/${l.id}`}
                        className="hover:text-gold-deep"
                      >
                        {l.name}
                      </Link>
                    )}
                  </td>
                  <td className="p-3 text-muted-2">
                    {l.kind === "ONLINE" ? "Website" : "Physical"}
                  </td>
                  <td className="p-3 text-muted-2">{l.address || "—"}</td>
                  <td className="p-3 text-muted-2">{l._count.sales}</td>
                  <td className="p-3">
                    <span
                      className="badge"
                      style={
                        l.active
                          ? { background: "#e6efe7", color: "#2c4030", borderColor: "#c2d8c6" }
                          : undefined
                      }
                    >
                      {l.active ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {l.kind === "STORE" ? (
                      <StoreRowActions id={l.id} active={l.active} />
                    ) : (
                      <span className="text-xs text-muted-2">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
