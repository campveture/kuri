"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  updateOrderStatus,
  setPaymentStatus,
  addOrderNote,
} from "@/app/admin/actions";
import { toast } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

const STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

const PAYMENTS = ["UNPAID", "PENDING_VERIFICATION", "PAID", "REFUNDED"] as const;

export function OrderControls({
  orderId,
  status,
  paymentStatus,
}: {
  orderId: string;
  status: string;
  paymentStatus: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [note, setNote] = useState("");

  const run = (
    fn: () => Promise<{ ok?: boolean; error?: string }>,
    ok: string,
  ) =>
    start(async () => {
      const res = await fn();
      if (res.error) toast(res.error, "error");
      else toast(ok, "success");
      router.refresh();
    });

  return (
    <section className="card space-y-5 p-5">
      <div>
        <h2 className="label">Order status</h2>
        <div className="grid grid-cols-2 gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              disabled={pending || s === status}
              onClick={() =>
                run(() => updateOrderStatus(orderId, s), `Status → ${s}`)
              }
              className={cn(
                "border px-2 py-2 text-xs font-semibold uppercase tracking-wide transition-colors disabled:opacity-40",
                s === status
                  ? "border-gold-deep bg-gold text-charcoal"
                  : "border-line hover:border-gold-deep",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="label">Payment status</h2>
        <div className="grid grid-cols-2 gap-2">
          {PAYMENTS.map((p) => (
            <button
              key={p}
              disabled={pending || p === paymentStatus}
              onClick={() =>
                run(
                  () => setPaymentStatus(orderId, p),
                  `Payment → ${p.replace(/_/g, " ")}`,
                )
              }
              className={cn(
                "border px-2 py-2 text-[11px] font-semibold uppercase tracking-wide transition-colors disabled:opacity-40",
                p === paymentStatus
                  ? "border-gold-deep bg-gold text-charcoal"
                  : "border-line hover:border-gold-deep",
              )}
            >
              {p.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="label">Add internal note</h2>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="textarea min-h-16 text-sm"
          placeholder="e.g. Called customer, confirmed address"
        />
        <button
          disabled={pending || !note.trim()}
          onClick={() =>
            run(async () => {
              const r = await addOrderNote(orderId, note);
              if ("ok" in r && r.ok) setNote("");
              return r;
            }, "Note added")
          }
          className="btn btn-sm btn-ghost mt-2 w-full"
        >
          Add note
        </button>
      </div>
    </section>
  );
}
