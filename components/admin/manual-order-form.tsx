"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createManualOrder } from "@/app/admin/orders/actions";
import { toast } from "@/components/ui/toaster";
import { formatBDT, cn } from "@/lib/utils";
import { SHIPPING_DEFAULTS } from "@/lib/site";

type PickProduct = {
  id: string;
  name: string;
  price: number;
  image: string;
  variants: { size: string; stock: number }[];
};

type Line = { productId: string; size: string; quantity: number };

export function ManualOrderForm({ products }: { products: PickProduct[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [lines, setLines] = useState<Line[]>([]);
  const [q, setQ] = useState("");
  const [c, setC] = useState({
    customerName: "",
    phone: "",
    email: "",
    addressLine: "",
    area: "",
    city: "Dhaka",
    note: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "BKASH" | "NAGAD">(
    "COD",
  );
  const [paymentStatus, setPaymentStatus] = useState<
    "UNPAID" | "PENDING_VERIFICATION" | "PAID"
  >("UNPAID");
  const [status, setStatus] = useState<
    "PENDING" | "CONFIRMED" | "PACKED" | "SHIPPED" | "DELIVERED"
  >("CONFIRMED");
  const [shippingOverride, setShippingOverride] = useState("");

  const byId = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products],
  );
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return products
      .filter((p) => !t || p.name.toLowerCase().includes(t))
      .slice(0, 12);
  }, [products, q]);

  const subtotal = lines.reduce((n, l) => {
    const p = byId.get(l.productId);
    return n + (p ? p.price * l.quantity : 0);
  }, 0);
  const shipping =
    shippingOverride.trim() !== ""
      ? Number(shippingOverride) || 0
      : subtotal >= SHIPPING_DEFAULTS.freeShippingThreshold
        ? 0
        : c.city.trim().toLowerCase() === "dhaka"
          ? SHIPPING_DEFAULTS.insideDhaka
          : SHIPPING_DEFAULTS.outsideDhaka;
  const total = subtotal + shipping;

  function addLine(productId: string) {
    const p = byId.get(productId);
    const firstSize =
      p?.variants.find((v) => v.stock > 0)?.size ?? p?.variants[0]?.size ?? "";
    setLines((ls) => [...ls, { productId, size: firstSize, quantity: 1 }]);
    setQ("");
  }
  function updateLine(i: number, patch: Partial<Line>) {
    setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }
  function removeLine(i: number) {
    setLines((ls) => ls.filter((_, idx) => idx !== i));
  }

  function submit() {
    start(async () => {
      const res = await createManualOrder({
        ...c,
        paymentMethod,
        paymentStatus,
        status,
        shippingOverride:
          shippingOverride.trim() !== "" ? Number(shippingOverride) : null,
        items: lines,
      });
      if (res.ok) {
        toast("Order created", "success");
        router.push(`/admin/orders/${res.id}`);
        router.refresh();
      } else {
        toast(res.error, "error");
      }
    });
  }

  return (
    <form
      className="grid gap-6 lg:grid-cols-[1fr_320px]"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div className="space-y-6">
        {/* Items */}
        <section className="card p-5">
          <h2 className="label">Items</h2>

          {lines.length > 0 && (
            <div className="mb-3 space-y-2">
              {lines.map((l, i) => {
                const p = byId.get(l.productId);
                if (!p) return null;
                return (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div className="h-9 w-9 shrink-0 overflow-hidden rounded border border-line bg-cream-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {p.image ? (
                        <img
                          src={p.image}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <span className="flex-1 truncate">{p.name}</span>
                    <select
                      value={l.size}
                      onChange={(e) => updateLine(i, { size: e.target.value })}
                      className="select w-24 py-1.5 text-xs"
                    >
                      {p.variants.map((v) => (
                        <option
                          key={v.size}
                          value={v.size}
                          disabled={v.stock <= 0}
                        >
                          {v.size} ({v.stock})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={1}
                      value={l.quantity}
                      onChange={(e) =>
                        updateLine(i, {
                          quantity: Math.max(1, Number(e.target.value) || 1),
                        })
                      }
                      className="input w-16 py-1.5 text-xs"
                    />
                    <span className="w-20 text-right">
                      {formatBDT(p.price * l.quantity)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeLine(i)}
                      className="px-1 text-muted-2 hover:text-negative"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <input
            className="input py-2 text-sm"
            placeholder="Search a product to add…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {q.trim() && (
            <div className="mt-1 max-h-52 overflow-y-auto border border-line">
              {filtered.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => addLine(p.id)}
                  className="flex w-full items-center gap-2 border-b border-line px-2 py-1.5 text-left text-sm hover:bg-cream-2"
                >
                  <div className="h-7 w-7 shrink-0 overflow-hidden rounded border border-line bg-cream-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {p.image ? (
                      <img
                        src={p.image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <span className="flex-1">{p.name}</span>
                  <span className="text-xs text-muted-2">
                    {formatBDT(p.price)}
                  </span>
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="p-3 text-xs text-muted-2">No match.</p>
              )}
            </div>
          )}
        </section>

        {/* Customer */}
        <section className="card grid gap-4 p-5 sm:grid-cols-2">
          <h2 className="label sm:col-span-2">Customer</h2>
          <div className="sm:col-span-2">
            <label className="label">Name</label>
            <input
              className="input"
              value={c.customerName}
              onChange={(e) => setC({ ...c, customerName: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Phone</label>
            <input
              className="input"
              value={c.phone}
              onChange={(e) => setC({ ...c, phone: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Email (optional)</label>
            <input
              className="input"
              value={c.email}
              onChange={(e) => setC({ ...c, email: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Address</label>
            <input
              className="input"
              value={c.addressLine}
              onChange={(e) => setC({ ...c, addressLine: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Area</label>
            <input
              className="input"
              value={c.area}
              onChange={(e) => setC({ ...c, area: e.target.value })}
            />
          </div>
          <div>
            <label className="label">City</label>
            <input
              className="input"
              value={c.city}
              onChange={(e) => setC({ ...c, city: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Note</label>
            <input
              className="input"
              value={c.note}
              onChange={(e) => setC({ ...c, note: e.target.value })}
            />
          </div>
        </section>
      </div>

      {/* Summary / settings */}
      <aside className="card h-max space-y-4 p-5">
        <div>
          <label className="label">Payment method</label>
          <select
            className="select text-sm"
            value={paymentMethod}
            onChange={(e) =>
              setPaymentMethod(e.target.value as typeof paymentMethod)
            }
          >
            <option value="COD">Cash on Delivery</option>
            <option value="BKASH">bKash</option>
            <option value="NAGAD">Nagad</option>
          </select>
        </div>
        <div>
          <label className="label">Payment status</label>
          <select
            className="select text-sm"
            value={paymentStatus}
            onChange={(e) =>
              setPaymentStatus(e.target.value as typeof paymentStatus)
            }
          >
            <option value="UNPAID">Unpaid</option>
            <option value="PENDING_VERIFICATION">Awaiting verification</option>
            <option value="PAID">Paid</option>
          </select>
        </div>
        <div>
          <label className="label">Order status</label>
          <select
            className="select text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
          >
            {["PENDING", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED"].map(
              (s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ),
            )}
          </select>
        </div>
        <div>
          <label className="label">Shipping ৳ (blank = auto)</label>
          <input
            className="input text-sm"
            inputMode="numeric"
            value={shippingOverride}
            onChange={(e) => setShippingOverride(e.target.value)}
            placeholder="auto"
          />
        </div>

        <div className="border-t border-line pt-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-2">Subtotal</span>
            <span>{formatBDT(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-2">Shipping</span>
            <span>{formatBDT(shipping)}</span>
          </div>
          <div className="mt-1 flex justify-between border-t border-line pt-1 font-semibold">
            <span>Total</span>
            <span>{formatBDT(total)}</span>
          </div>
        </div>

        <button
          type="submit"
          className={cn("btn btn-primary w-full", pending && "opacity-60")}
          disabled={pending || lines.length === 0}
        >
          {pending ? "Creating…" : "Create order"}
        </button>
        <Link
          href="/admin/orders"
          className="block text-center text-xs uppercase tracking-[0.12em] text-muted-2 hover:text-gold-deep"
        >
          Cancel
        </Link>
      </aside>
    </form>
  );
}
