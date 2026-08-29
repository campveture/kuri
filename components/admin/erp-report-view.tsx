import { formatBDT } from "@/lib/utils";
import type { ErpReport } from "@/lib/erp";

const GOLD = "#c89a3e";
const GREEN = "#3f5c43";
const GRID = "#e4d9c2";
const MUTED = "#7a6e56";

export function ErpReportView({ report }: { report: ErpReport }) {
  const t = report.totals;
  const cards = [
    { k: "Revenue", v: formatBDT(t.revenue), sub: `${t.orders} sales · ${t.units} units` },
    { k: "Cost of goods", v: formatBDT(t.cogs) },
    { k: "Gross profit", v: formatBDT(t.grossProfit) },
    { k: "Expenses", v: formatBDT(t.expenses) },
    { k: "Net profit", v: formatBDT(t.netProfit), accent: t.netProfit >= 0 },
    { k: "Stock value", v: formatBDT(t.stockValue) },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {cards.map((c) => (
          <div key={c.k} className="card p-4">
            <p className="text-[11px] uppercase tracking-[0.12em] text-muted-2">{c.k}</p>
            <p
              className={`h-display mt-1 text-xl ${
                c.accent === undefined ? "" : c.accent ? "text-positive" : "text-negative"
              }`}
            >
              {c.v}
            </p>
            {c.sub && <p className="mt-0.5 text-[11px] text-muted-2">{c.sub}</p>}
          </div>
        ))}
      </div>

      <SalesChart data={report.salesByDay} />

      <div>
        <h2 className="h-display mb-3 text-xl">By location</h2>
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream-2 text-xs uppercase tracking-[0.1em] text-muted-2">
              <tr>
                <th className="p-3 text-left">Location</th>
                <th className="p-3 text-right">Sales</th>
                <th className="p-3 text-right">Revenue</th>
                <th className="p-3 text-right">COGS</th>
                <th className="p-3 text-right">Gross</th>
                <th className="p-3 text-right">Expenses</th>
                <th className="p-3 text-right">Net</th>
                <th className="p-3 text-right">Stock value</th>
              </tr>
            </thead>
            <tbody>
              {report.locations.map((l) => (
                <tr key={l.id} className="border-t border-line">
                  <td className="p-3">
                    {l.name}
                    <span className="ml-2 text-[11px] text-muted-2">
                      {l.kind === "ONLINE" ? "web" : "shop"}
                    </span>
                  </td>
                  <td className="p-3 text-right text-muted-2">{l.orders}</td>
                  <td className="p-3 text-right">{formatBDT(l.revenue)}</td>
                  <td className="p-3 text-right text-muted-2">{formatBDT(l.cogs)}</td>
                  <td className="p-3 text-right text-muted-2">{formatBDT(l.grossProfit)}</td>
                  <td className="p-3 text-right text-muted-2">{formatBDT(l.expenses)}</td>
                  <td className={`p-3 text-right ${l.netProfit >= 0 ? "text-positive" : "text-negative"}`}>
                    {formatBDT(l.netProfit)}
                  </td>
                  <td className="p-3 text-right text-muted-2">{formatBDT(l.stockValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {report.expenseByCategory.length > 0 && (
        <div>
          <h2 className="h-display mb-3 text-xl">Expenses by category</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {report.expenseByCategory.map((e) => (
              <div
                key={e.category}
                className="card flex items-center justify-between px-3 py-2 text-sm"
              >
                <span className="text-muted-2">
                  {e.category[0] + e.category.slice(1).toLowerCase()}
                </span>
                <span>{formatBDT(e.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SalesChart({ data }: { data: ErpReport["salesByDay"] }) {
  if (data.length === 0) return null;
  const W = 720;
  const H = 200;
  const pad = { l: 8, r: 8, t: 10, b: 22 };
  const max = Math.max(1, ...data.map((d) => d.online + d.store));
  const bw = (W - pad.l - pad.r) / data.length;
  const y = (v: number) => pad.t + (H - pad.t - pad.b) * (1 - v / max);
  const labelEvery = Math.ceil(data.length / 8);

  return (
    <div>
      <div className="mb-2 flex items-center gap-4 text-xs text-muted-2">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-3" style={{ background: GOLD }} /> Online
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-3" style={{ background: GREEN }} /> In-store
        </span>
      </div>
      <div className="card overflow-x-auto p-3">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-[200px] w-full min-w-[560px]"
          role="img"
          aria-label="Daily revenue, online vs in-store"
        >
          {[0.25, 0.5, 0.75, 1].map((f) => (
            <line key={f} x1={pad.l} x2={W - pad.r} y1={y(max * f)} y2={y(max * f)} stroke={GRID} strokeWidth={1} />
          ))}
          {data.map((d, i) => {
            const x = pad.l + i * bw + bw * 0.15;
            const w = bw * 0.7;
            const onlineH = (H - pad.t - pad.b) * (d.online / max);
            const storeH = (H - pad.t - pad.b) * (d.store / max);
            const baseY = H - pad.b;
            return (
              <g key={d.date}>
                <rect x={x} y={baseY - onlineH} width={w} height={Math.max(0, onlineH)} fill={GOLD} rx={2}>
                  <title>{`${d.label}: ${formatBDT(d.online + d.store)}`}</title>
                </rect>
                <rect
                  x={x}
                  y={baseY - onlineH - storeH - (storeH > 0 ? 2 : 0)}
                  width={w}
                  height={Math.max(0, storeH)}
                  fill={GREEN}
                  rx={2}
                />
                {i % labelEvery === 0 && (
                  <text x={x + w / 2} y={H - 6} textAnchor="middle" fontSize={9} fill={MUTED}>
                    {d.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
