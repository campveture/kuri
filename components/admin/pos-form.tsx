"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { recordStoreSale } from "@/app/admin/stores/actions";
import { toast } from "@/components/ui/toaster";
import { formatBDT } from "@/lib/utils";

type Variant = { variantId: string; size: string; stockByLoc: Record<string, number> };
type Product = {
  id: string;
  name: string;
  price: number;
  image: string | null;
  accent?: string;
  variants: Variant[];
};
type Loc = { id: string; name: string; kind: "ONLINE" | "STORE" };

type Line = {
  productId: string;
  variantId: string;
  name: string;
  size: string;
  price: number;
  quantity: number;
};

export function PosForm({
  locations,
  products,
}: {
  locations: Loc[];
  products: Product[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [locationId, setLocationId] = useState(
    locations.find((l) => l.kind === "STORE")?.id ?? locations[0]?.id ?? "",
  );
  const [query, setQuery] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [discount, setDiscount] = useState("0");
  const [payment, setPayment] = useState<"CASH" | "BKASH" | "NAGAD" | "CARD">("CASH");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [note, setNote] = useState("");

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter((p) => p.name.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query, products]);

  function stockFor(p: Product, size: string) {
    const v = p.variants.find((x) => x.size === size);
    return v ? v.stockByLoc[locationId] ?? 0 : 0;
  }

  function addLine(p: Product) {
    const first = p.variants[0];
    if (!first) return;
    setLines((ls) => [
      ...ls,
      {
        productId: p.id,
        variantId: first.variantId,
        name: p.name,
        size: first.size,
        price: p.price,
        quantity: 1,
      },
    ]);
    setQuery("");
  }

  function patchLine(i: number, patch: Partial<Line>) {
    setLines((ls) => ls.map((l, k) => (k === i ? { ...l, ...patch } : l)));
  }

  function changeSize(i: number, size: string) {
    const l = lines[i];
    const p = products.find((x) => x.id === l.productId);
    const v = p?.variants.find((x) => x.size === size);
    patchLine(i, { size, variantId: v?.variantId ?? l.variantId });
  }

  const subtotal = lines.reduce((n, l) => n + l.price * l.quantity, 0);
  const disc = Math.max(0, Math.round(Number(discount) || 0));
  const total = Math.max(0, subtotal - disc);

  function submit() {
    if (!locationId) return toast("Pick a store", "error");
    if (lines.length === 0) return toast("Add at least one item", "error");
    start(async () => {
      const res = await recordStoreSale({
        locationId,
        paymentMethod: payment,
        discount: disc,
        customerName,
        customerPhone,
        note,
        items: lines.map((l) => ({
          variantId: l.variantId,
          quantity: l.quantity,
        })),
      });
      if (res.ok) {
        toast("Sale recorded", "success");
        setLines([]);
        setDiscount("0");
        setCustomerName("");
        setCustomerPhone("");
        setNote("");
        router.refresh();
      } else {
        toast(res.error, "error");
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      {/* left: catalogue */}
      <div className="space-y-4">
        <div>
          <label className="label">Store</label>
          <select
            className="select"
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
          >
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
                {l.kind === "ONLINE" ? " (website stock)" : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <label className="label">Add product</label>
          <input
            className="input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name…"
          />
          {matches.length > 0 && (
            <div className="absolute z-10 mt-1 w-full border border-line bg-cream shadow-lg">
              {matches.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => addLine(p)}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-cream-2"
                >
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image} alt="" className="h-8 w-8 border border-line object-cover" />
                  ) : (
                    <span className="h-8 w-8 shrink-0 rounded-sm border border-line" style={{ background: p.accent ?? "#c89a3e" }} />
                  )}
                  <span className="flex-1">{p.name}</span>
                  <span className="text-muted-2">{formatBDT(p.price)}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-cream-2 text-xs uppercase tracking-[0.1em] text-muted-2">
              <tr>
                <th className="p-2 text-left">Item</th>
                <th className="p-2 text-left">Weight</th>
                <th className="p-2 text-left">Qty</th>
                <th className="p-2 text-right">Total</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {lines.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-muted-2">
                    No items yet.
                  </td>
                </tr>
              )}
              {lines.map((l, i) => {
                const p = products.find((x) => x.id === l.productId)!;
                const avail = stockFor(p, l.size);
                return (
                  <tr key={i} className="border-t border-line">
                    <td className="p-2">{l.name}</td>
                    <td className="p-2">
                      <select
                        className="select w-auto py-1 text-xs"
                        value={l.size}
                        onChange={(e) => changeSize(i, e.target.value)}
                      >
                        {p.variants.map((v) => (
                          <option key={v.variantId} value={v.size}>
                            {v.size}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        min={1}
                        className="input w-16 py-1 text-xs"
                        value={l.quantity}
                        onChange={(e) =>
                          patchLine(i, { quantity: Math.max(1, Number(e.target.value) || 1) })
                        }
                      />
                      <span
                        className={`ml-1 text-[11px] ${
                          l.quantity > avail ? "text-negative" : "text-muted-2"
                        }`}
                      >
                        /{avail}
                      </span>
                    </td>
                    <td className="p-2 text-right">
                      {formatBDT(l.price * l.quantity)}
                    </td>
                    <td className="p-2 text-right">
                      <button
                        type="button"
                        onClick={() => setLines((ls) => ls.filter((_, k) => k !== i))}
                        className="text-muted-2 hover:text-negative"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* right: checkout */}
      <div className="card space-y-4 p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label">Customer name</label>
            <input
              className="input"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="(optional)"
            />
          </div>
          <div>
            <label className="label">Phone</label>
            <input
              className="input"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="(optional)"
            />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label">Discount (৳)</label>
            <input
              className="input"
              inputMode="numeric"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Payment</label>
            <select
              className="select"
              value={payment}
              onChange={(e) => setPayment(e.target.value as typeof payment)}
            >
              <option value="CASH">Cash</option>
              <option value="BKASH">bKash</option>
              <option value="NAGAD">Nagad</option>
              <option value="CARD">Card</option>
            </select>
          </div>
        </div>
        <div>
          <label className="label">Note</label>
          <input
            className="input"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <dl className="space-y-1 border-t border-line pt-3 text-sm">
          <div className="flex justify-between text-muted-2">
            <dt>Subtotal</dt>
            <dd>{formatBDT(subtotal)}</dd>
          </div>
          <div className="flex justify-between text-muted-2">
            <dt>Discount</dt>
            <dd>− {formatBDT(disc)}</dd>
          </div>
          <div className="flex justify-between text-lg">
            <dt className="h-display">Total</dt>
            <dd className="h-display">{formatBDT(total)}</dd>
          </div>
        </dl>

        <button
          onClick={submit}
          disabled={pending || lines.length === 0}
          className="btn btn-primary w-full"
        >
          {pending ? "Recording…" : "Record sale"}
        </button>
      </div>
    </div>
  );
}
