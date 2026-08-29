"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adjustStock, transferStock } from "@/app/admin/stores/actions";
import { toast } from "@/components/ui/toaster";
import { formatBDT } from "@/lib/utils";

type Col = { id: string; name: string; kind: "ONLINE" | "STORE" };
type Row = {
  productId: string;
  productName: string;
  costPrice: number;
  variantId: string;
  size: string;
  qty: Record<string, number>; // colId -> qty
};

export function InventoryMatrix({
  columns,
  rows,
}: {
  columns: Col[];
  rows: Row[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [q, setQ] = useState("");

  const [sel, setSel] = useState<{ row: Row; colId: string } | null>(null);
  const [mode, setMode] = useState<"set" | "delta">("set");
  const [value, setValue] = useState("");

  const [xfer, setXfer] = useState({ from: "", to: "", qty: "" });
  const [xferRow, setXferRow] = useState<Row | null>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s
      ? rows.filter((r) => r.productName.toLowerCase().includes(s))
      : rows;
  }, [q, rows]);

  const totalValue = columns.map((c) => ({
    col: c,
    value: rows.reduce((n, r) => n + (r.qty[c.id] ?? 0) * r.costPrice, 0),
    units: rows.reduce((n, r) => n + (r.qty[c.id] ?? 0), 0),
  }));

  function applyAdjust() {
    if (!sel) return;
    const v = Number(value);
    if (!Number.isFinite(v)) return toast("Enter a number", "error");
    start(async () => {
      const res = await adjustStock({
        locationId: sel.colId,
        variantId: sel.row.variantId,
        mode,
        value: v,
      });
      if (res.ok) {
        toast("Stock updated", "success");
        setSel(null);
        setValue("");
        router.refresh();
      } else {
        toast(res.error, "error");
      }
    });
  }

  function applyTransfer() {
    if (!xferRow) return;
    const qty = Number(xfer.qty);
    if (!xfer.from || !xfer.to) return toast("Pick both stores", "error");
    if (!(qty > 0)) return toast("Enter a quantity", "error");
    start(async () => {
      const res = await transferStock({
        fromLocationId: xfer.from,
        toLocationId: xfer.to,
        variantId: xferRow.variantId,
        quantity: qty,
      });
      if (res.ok) {
        toast("Stock transferred", "success");
        setXferRow(null);
        setXfer({ from: "", to: "", qty: "" });
        router.refresh();
      } else {
        toast(res.error, "error");
      }
    });
  }

  return (
    <div className="space-y-4">
      <input
        className="input max-w-xs"
        placeholder="Filter products…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      {/* adjust bar */}
      {sel && (
        <div className="flex flex-wrap items-center gap-3 border border-gold-deep bg-cream-2 p-3 text-sm">
          <span>
            {sel.row.productName} · {sel.row.size} @{" "}
            {columns.find((c) => c.id === sel.colId)?.name}
          </span>
          <select
            className="select w-auto py-1 text-xs"
            value={mode}
            onChange={(e) => setMode(e.target.value as "set" | "delta")}
          >
            <option value="set">Set to</option>
            <option value="delta">Add / subtract</option>
          </select>
          <input
            className="input w-24 py-1 text-xs"
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={mode === "delta" ? "e.g. -2" : "0"}
          />
          <button
            className="btn btn-primary btn-sm"
            onClick={applyAdjust}
            disabled={pending}
          >
            Apply
          </button>
          <button
            className="btn btn-sm btn-ghost"
            onClick={() => setSel(null)}
          >
            Cancel
          </button>
        </div>
      )}

      {/* transfer bar */}
      {xferRow && (
        <div className="flex flex-wrap items-center gap-3 border border-line bg-cream-2 p-3 text-sm">
          <span>
            Transfer {xferRow.productName} · {xferRow.size}
          </span>
          <select
            className="select w-auto py-1 text-xs"
            value={xfer.from}
            onChange={(e) => setXfer((s) => ({ ...s, from: e.target.value }))}
          >
            <option value="">from…</option>
            {columns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <span className="text-muted-2">→</span>
          <select
            className="select w-auto py-1 text-xs"
            value={xfer.to}
            onChange={(e) => setXfer((s) => ({ ...s, to: e.target.value }))}
          >
            <option value="">to…</option>
            {columns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            className="input w-20 py-1 text-xs"
            type="number"
            min={1}
            value={xfer.qty}
            onChange={(e) => setXfer((s) => ({ ...s, qty: e.target.value }))}
            placeholder="qty"
          />
          <button
            className="btn btn-primary btn-sm"
            onClick={applyTransfer}
            disabled={pending}
          >
            Move
          </button>
          <button
            className="btn btn-sm btn-ghost"
            onClick={() => setXferRow(null)}
          >
            Cancel
          </button>
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-cream-2 text-xs uppercase tracking-[0.1em] text-muted-2">
            <tr>
              <th className="p-2 text-left">Product</th>
              <th className="p-2 text-left">Weight</th>
              {columns.map((c) => (
                <th key={c.id} className="p-2 text-center">
                  {c.name}
                </th>
              ))}
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.variantId} className="border-t border-line">
                <td className="p-2">{r.productName}</td>
                <td className="p-2 text-muted-2">{r.size}</td>
                {columns.map((c) => {
                  const qty = r.qty[c.id] ?? 0;
                  return (
                    <td key={c.id} className="p-2 text-center">
                      <button
                        onClick={() => {
                          setSel({ row: r, colId: c.id });
                          setMode("set");
                          setValue(String(qty));
                        }}
                        className={`min-w-10 rounded px-2 py-1 tabular-nums hover:bg-cream-2 ${
                          qty === 0
                            ? "text-muted-2"
                            : qty <= 3
                              ? "text-negative"
                              : ""
                        }`}
                      >
                        {qty}
                      </button>
                    </td>
                  );
                })}
                <td className="p-2 text-right">
                  <button
                    onClick={() => {
                      setXferRow(r);
                      setXfer({ from: "", to: "", qty: "" });
                    }}
                    className="text-xs text-gold-deep hover:underline"
                  >
                    transfer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t-2 border-line bg-cream-2 text-xs">
            <tr>
              <td className="p-2 text-muted-2" colSpan={2}>
                Stock value
              </td>
              {totalValue.map((tv) => (
                <td key={tv.col.id} className="p-2 text-center text-muted-2">
                  {formatBDT(tv.value)}
                  <span className="block text-[10px]">{tv.units} units</span>
                </td>
              ))}
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="text-xs text-muted-2">
        Click any number to set or adjust it. Low stock (≤3) shows red. The
        Online column is the website&rsquo;s stock.
      </p>
    </div>
  );
}
