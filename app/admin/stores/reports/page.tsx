import Link from "next/link";
import { getErpReport } from "@/lib/erp";
import { ErpReportView } from "@/components/admin/erp-report-view";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Profit & loss" };

const RANGES = [
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
  { days: 365, label: "1 year" },
];

export default async function ReportsPage(props: {
  searchParams: Promise<{ days?: string }>;
}) {
  await requireAdmin();
  const { days: daysParam } = await props.searchParams;
  const days = [7, 30, 90, 365].includes(Number(daysParam))
    ? Number(daysParam)
    : 30;
  const to = new Date();
  const from = new Date(to.getTime() - (days - 1) * 86400000);
  const report = await getErpReport(from, to);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link
            href="/admin/stores"
            className="text-xs text-muted-2 hover:text-gold-deep"
          >
            ← Stores
          </Link>
          <h1 className="h-display mt-1 text-3xl">Profit &amp; loss</h1>
          <p className="mt-1 text-sm text-muted-2">
            {report.from} → {report.to} · website orders + counter sales combined.
          </p>
        </div>
        <div className="flex gap-1">
          {RANGES.map((r) => (
            <Link
              key={r.days}
              href={`/admin/stores/reports?days=${r.days}`}
              className={
                r.days === days
                  ? "btn btn-primary btn-sm"
                  : "btn btn-outline btn-sm"
              }
            >
              {r.label}
            </Link>
          ))}
        </div>
      </div>

      <ErpReportView report={report} />

      <p className="text-xs text-muted-2">
        Revenue includes delivery charges collected on website orders. Cost of
        goods uses each product&rsquo;s <em>Cost / unit</em> captured at sale
        time — set it on the product page for accurate profit.
      </p>
    </div>
  );
}
