"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { formatBDT } from "@/lib/utils";
import { placeOrder, applyDiscount, type CheckoutState } from "@/app/(site)/checkout/actions";

type Settings = {
  bkashNumber: string;
  bkashType: string;
  nagadNumber: string;
  nagadType: string;
  shippingInsideDhaka: number;
  shippingOutsideDhaka: number;
  freeShippingThreshold: number;
};
type Prefill = {
  customerName: string;
  phone: string;
  email: string;
  addressLine: string;
  area: string;
  city: string;
};
type Method = "COD" | "BKASH" | "NAGAD";

export function CheckoutForm({ settings, prefill }: { settings: Settings; prefill: Prefill }) {
  const router = useRouter();
  const { lines, ready, totalPrice, clear } = useCart();
  const [pending, start] = useTransition();

  const [f, setF] = useState<Prefill & { note: string }>({ ...prefill, note: "" });
  const [method, setMethod] = useState<Method>("COD");
  const [trx, setTrx] = useState({ transactionId: "", senderNumber: "" });
  const [code, setCode] = useState("");
  // `at` = the subtotal the code was validated against; if the cart changes the
  // discount is stale and ignored until re-applied (pure derivation, no effect).
  const [discount, setDiscount] = useState<{ amount: number; label: string; at: number } | null>(null);
  const [codeMsg, setCodeMsg] = useState<string | null>(null);
  const [codePending, setCodePending] = useState(false);
  const [state, setState] = useState<CheckoutState>({});
  const [acceptedTotal, setAcceptedTotal] = useState<number | null>(null);
  const submitting = useRef(false);

  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));

  const shipping = useMemo(() => {
    if (totalPrice >= settings.freeShippingThreshold) return 0;
    return f.city.trim().toLowerCase() === "dhaka"
      ? settings.shippingInsideDhaka
      : settings.shippingOutsideDhaka;
  }, [totalPrice, f.city, settings]);

  const discountStale = discount != null && discount.at !== totalPrice;
  const activeDiscount = discountStale ? null : discount;
  const discountAmount = activeDiscount?.amount ?? 0;
  const total = Math.max(0, totalPrice - discountAmount) + shipping;
  const expected = acceptedTotal != null && !discountStale ? acceptedTotal : total;

  async function checkCode(): Promise<boolean> {
    if (!code.trim()) return true;
    setCodePending(true);
    try {
      const r = await applyDiscount(code, totalPrice);
      if (r.ok) {
        setDiscount({ amount: r.amount, label: r.label, at: totalPrice });
        setCodeMsg(`${r.label} applied`);
        return true;
      }
      setDiscount(null);
      setCodeMsg(r.error);
      return false;
    } finally {
      setCodePending(false);
    }
  }

  function submit() {
    if (submitting.current) return;
    setState({});
    start(async () => {
      submitting.current = true;
      try {
        // A code typed but never applied (or gone stale) — validate it now.
        if (code.trim() && !activeDiscount) {
          const okCode = await checkCode();
          if (!okCode) return;
        }
        const res = await placeOrder({
          customerName: f.customerName,
          phone: f.phone,
          email: f.email,
          addressLine: f.addressLine,
          area: f.area,
          city: f.city,
          note: f.note,
          paymentMethod: method,
          transactionId: trx.transactionId,
          senderNumber: trx.senderNumber,
          discountCode: code.trim(),
          expectedTotal: expected,
          items: lines.map((l) => ({
            productId: l.productId,
            size: l.size,
            quantity: l.quantity,
            purchaseOption: l.purchaseOption,
            frequencyWeeks: l.frequencyWeeks,
          })),
        });
        if (res.ok && res.orderNumber) {
          clear();
          router.push(`/order/${res.orderNumber}`);
        } else {
          setState(res);
          if (res.priceChanged) setAcceptedTotal(res.priceChanged.total);
        }
      } finally {
        submitting.current = false;
      }
    });
  }

  if (ready && lines.length === 0) {
    return (
      <p className="mt-10 text-sm text-muted">
        Your cart is empty. <Link href="/shop" className="underline">Browse the teas →</Link>
      </p>
    );
  }

  const err = (k: string) => state.fieldErrors?.[k]?.[0];

  return (
    <form
      className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div className="space-y-6">
        <section className="card p-5">
          <h2 className="h-display text-lg">Delivery</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Full name" v={f.customerName} on={(x) => set("customerName", x)} e={err("customerName")} required />
            <Field label="Phone" v={f.phone} on={(x) => set("phone", x)} e={err("phone")} required />
            <Field label="Email (optional)" v={f.email} on={(x) => set("email", x)} e={err("email")} />
            <Field label="City" v={f.city} on={(x) => set("city", x)} e={err("city")} required />
          </div>
          <div className="mt-4">
            <Field label="Address" v={f.addressLine} on={(x) => set("addressLine", x)} e={err("addressLine")} required />
          </div>
          <div className="mt-4">
            <Field label="Area / thana" v={f.area} on={(x) => set("area", x)} e={err("area")} required />
          </div>
          <div className="mt-4">
            <label className="label">Order note (optional)</label>
            <textarea className="textarea" value={f.note} onChange={(e) => set("note", e.target.value)} />
          </div>
        </section>

        <section className="card p-5">
          <h2 className="h-display text-lg">Payment</h2>
          <div className="mt-4 space-y-2">
            {(["COD", "BKASH", "NAGAD"] as Method[]).map((m) => (
              <label key={m} className="flex items-center gap-3 border border-line px-4 py-3 text-sm">
                <input type="radio" name="method" checked={method === m} onChange={() => setMethod(m)} />
                <span className="font-semibold">
                  {m === "COD" ? "Cash on Delivery" : m === "BKASH" ? "bKash" : "Nagad"}
                </span>
              </label>
            ))}
          </div>
          {method !== "COD" && (
            <div className="mt-4 space-y-3 border border-line p-4 text-sm">
              <p className="text-muted">
                Send <b>{formatBDT(total)}</b> to{" "}
                <b>
                  {method === "BKASH" ? settings.bkashNumber : settings.nagadNumber}
                </b>{" "}
                ({method === "BKASH" ? settings.bkashType : settings.nagadType}), then enter the details below.
              </p>
              <Field label="Transaction ID" v={trx.transactionId} on={(x) => setTrx((p) => ({ ...p, transactionId: x }))} e={err("transactionId")} />
              <Field label="Number you paid from" v={trx.senderNumber} on={(x) => setTrx((p) => ({ ...p, senderNumber: x }))} e={err("senderNumber")} />
            </div>
          )}
        </section>
      </div>

      <aside className="card h-max space-y-4 p-5 text-sm">
        <h2 className="h-display text-lg">Your order</h2>
        <ul className="space-y-3 border-y border-line py-3">
          {lines.map((l, i) => (
            <li key={i} className="flex justify-between gap-3">
              <span className="text-muted-2">
                {l.name} · {l.size} × {l.quantity}
                {l.purchaseOption === "subscribe" ? " (subscribe)" : ""}
              </span>
              <span>{formatBDT(l.unitPrice * l.quantity)}</span>
            </li>
          ))}
        </ul>

        <div className="flex gap-2">
          <label htmlFor="co-code" className="sr-only">Discount code</label>
          <input
            id="co-code"
            className="input py-2 text-sm"
            placeholder="Discount code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => checkCode()}
            disabled={codePending || !code.trim()}
          >
            {codePending ? "…" : "Apply"}
          </button>
        </div>
        {codeMsg && (
          <p className="text-xs text-muted-2">
            {discountStale ? "Cart changed — tap Apply again." : codeMsg}
          </p>
        )}

        <dl className="space-y-1.5">
          <Row k="Subtotal" v={formatBDT(totalPrice)} />
          {activeDiscount && (
            <Row k={`Discount (${activeDiscount.label})`} v={`−${formatBDT(discountAmount)}`} accent />
          )}
          <Row k="Shipping" v={shipping === 0 ? "Free" : formatBDT(shipping)} />
          <div className="flex justify-between border-t border-line pt-2 text-base font-semibold">
            <dt>Total</dt>
            <dd>{formatBDT(total)}</dd>
          </div>
        </dl>

        {state.error && (
          <p className="border border-[#b03636]/40 bg-[#b03636]/10 px-3 py-2 text-xs text-negative" role="alert">
            {state.error}
            {state.priceChanged && (
              <span className="mt-1 block font-semibold">
                Updated total: {formatBDT(state.priceChanged.total)}. Tap Place order again to confirm.
              </span>
            )}
          </p>
        )}

        <button type="submit" className="btn btn-primary w-full" disabled={pending || !ready || lines.length === 0}>
          {pending ? "Placing order…" : "Place order"}
        </button>
        <p className="text-center text-[11px] text-muted-2">
          By placing this order you agree to our delivery &amp; returns terms.
        </p>
      </aside>
    </form>
  );
}

function Field({
  label,
  v,
  on,
  e,
  required,
}: {
  label: string;
  v: string;
  on: (v: string) => void;
  e?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <input className="input" value={v} onChange={(ev) => on(ev.target.value)} required={required} />
      {e && <p className="mt-1 text-xs text-negative">{e}</p>}
    </div>
  );
}

function Row({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <div className={"flex justify-between " + (accent ? "text-gold-deep" : "")}>
      <dt className={accent ? "" : "text-muted-2"}>{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}
