"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveDiscount } from "@/app/admin/discounts/actions";
import { toast } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

export type DiscountValues = {
  id?: string;
  code: string;
  type: "PERCENT" | "FIXED";
  value: string;
  minSubtotal: string;
  maxUses: string;
  startsAt: string;
  endsAt: string;
  active: boolean;
};

const EMPTY: DiscountValues = {
  code: "",
  type: "PERCENT",
  value: "",
  minSubtotal: "0",
  maxUses: "",
  startsAt: "",
  endsAt: "",
  active: true,
};

export function DiscountForm({ initial }: { initial?: Partial<DiscountValues> }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [v, setV] = useState<DiscountValues>({ ...EMPTY, ...initial });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const set = <K extends keyof DiscountValues>(k: K, val: DiscountValues[K]) =>
    setV((p) => ({ ...p, [k]: val }));

  function submit() {
    setErrors({});
    start(async () => {
      const res = await saveDiscount({
        id: v.id,
        code: v.code,
        type: v.type,
        value: v.value,
        minSubtotal: v.minSubtotal || "0",
        maxUses: v.maxUses || undefined,
        startsAt: v.startsAt || undefined,
        endsAt: v.endsAt || undefined,
        active: v.active,
      });
      if (res.ok) {
        toast(v.id ? "Discount updated" : "Discount created", "success");
        router.push("/admin/discounts");
        router.refresh();
      } else {
        setErrors(res.fieldErrors ?? {});
        toast(res.error ?? "Could not save", "error");
      }
    });
  }

  return (
    <form
      className="max-w-xl space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div className="card grid gap-4 p-5">
        <div>
          <label className="label" htmlFor="disc-code">Code</label>
          <input
            id="disc-code"
            className="input uppercase"
            value={v.code}
            onChange={(e) => set("code", e.target.value.toUpperCase())}
            placeholder="KURI10"
            required
          />
          <Err e={errors.code} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="disc-type">Type</label>
            <select
              id="disc-type"
              className="select"
              value={v.type}
              onChange={(e) => set("type", e.target.value as "PERCENT" | "FIXED")}
            >
              <option value="PERCENT">Percentage off</option>
              <option value="FIXED">Fixed ৳ off</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="disc-value">
              {v.type === "PERCENT" ? "Percent (1–100)" : "Amount (৳)"}
            </label>
            <input
              id="disc-value"
              className="input"
              inputMode="numeric"
              value={v.value}
              onChange={(e) => set("value", e.target.value)}
              required
            />
            <Err e={errors.value} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="disc-min-subtotal">Minimum order (৳)</label>
            <input
              id="disc-min-subtotal"
              className="input"
              inputMode="numeric"
              value={v.minSubtotal}
              onChange={(e) => set("minSubtotal", e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="disc-max-uses">Max uses (blank = unlimited)</label>
            <input
              id="disc-max-uses"
              className="input"
              inputMode="numeric"
              value={v.maxUses}
              onChange={(e) => set("maxUses", e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="disc-starts-at">Starts (optional)</label>
            <input
              id="disc-starts-at"
              type="date"
              className="input"
              value={v.startsAt}
              onChange={(e) => set("startsAt", e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="disc-ends-at">Expires (optional)</label>
            <input
              id="disc-ends-at"
              type="date"
              className="input"
              value={v.endsAt}
              onChange={(e) => set("endsAt", e.target.value)}
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={v.active}
            onChange={(e) => set("active", e.target.checked)}
          />
          Active
        </label>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className={cn("btn btn-primary", pending && "opacity-60")}
          disabled={pending}
        >
          {pending ? "Saving…" : v.id ? "Save changes" : "Create discount"}
        </button>
        <Link href="/admin/discounts" className="btn btn-outline">
          Cancel
        </Link>
      </div>
    </form>
  );
}

function Err({ e }: { e?: string[] }) {
  if (!e?.length) return null;
  return <p className="mt-1 text-xs text-negative">{e[0]}</p>;
}
