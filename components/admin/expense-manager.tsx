"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveExpense, deleteExpense } from "@/app/admin/stores/actions";
import { toast } from "@/components/ui/toaster";
import { formatBDT, formatDate } from "@/lib/utils";

const CATS = ["RENT", "SALARY", "UTILITIES", "MARKETING", "SUPPLIES", "LOGISTICS", "RESTOCK", "OTHER"];

type Expense = {
  id: string;
  category: string;
  amount: number;
  note: string | null;
  incurredAt: string;
  locationName: string | null;
};

export function ExpenseManager({
  locations,
  expenses,
}: {
  locations: { id: string; name: string }[];
  expenses: Expense[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [category, setCategory] = useState("RENT");
  const [amount, setAmount] = useState("");
  const [locationId, setLocationId] = useState("");
  const [note, setNote] = useState("");
  const [incurredAt, setIncurredAt] = useState(
    new Date().toISOString().slice(0, 10),
  );

  function add() {
    const amt = Number(amount);
    if (!(amt > 0)) return toast("Enter an amount", "error");
    start(async () => {
      const res = await saveExpense({
        category,
        amount: amt,
        locationId: locationId || undefined,
        note,
        incurredAt,
      });
      if (res.ok) {
        toast("Expense added", "success");
        setAmount("");
        setNote("");
        router.refresh();
      } else {
        toast(res.error, "error");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="card grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <label className="label">Category</label>
          <select
            className="select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATS.map((c) => (
              <option key={c} value={c}>
                {c[0] + c.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Amount (৳)</label>
          <input
            className="input"
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Store</label>
          <select
            className="select"
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
          >
            <option value="">Company-wide</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Date</label>
          <input
            type="date"
            className="input"
            value={incurredAt}
            onChange={(e) => setIncurredAt(e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <button className="btn btn-primary w-full" onClick={add} disabled={pending}>
            Add
          </button>
        </div>
        <div className="sm:col-span-2 lg:col-span-5">
          <input
            className="input"
            placeholder="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-cream-2 text-xs uppercase tracking-[0.1em] text-muted-2">
            <tr>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Store</th>
              <th className="p-3 text-left">Note</th>
              <th className="p-3 text-right">Amount</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-muted-2">
                  No expenses recorded yet.
                </td>
              </tr>
            )}
            {expenses.map((e) => (
              <tr key={e.id} className="border-t border-line">
                <td className="p-3 text-muted-2">{formatDate(e.incurredAt)}</td>
                <td className="p-3">
                  {e.category[0] + e.category.slice(1).toLowerCase()}
                </td>
                <td className="p-3 text-muted-2">{e.locationName ?? "Company-wide"}</td>
                <td className="p-3 text-muted-2">{e.note ?? "—"}</td>
                <td className="p-3 text-right">{formatBDT(e.amount)}</td>
                <td className="p-3 text-right">
                  <button
                    onClick={() =>
                      start(async () => {
                        const r = await deleteExpense(e.id);
                        if (r.ok) router.refresh();
                        else toast(r.error, "error");
                      })
                    }
                    className="text-xs text-muted-2 hover:text-negative"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
