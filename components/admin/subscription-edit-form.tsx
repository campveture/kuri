"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSubscription } from "@/app/admin/subscriptions/actions";
import { toast } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

type Variant = { id: string; size: string; stock: number };

export function SubscriptionEditForm({
  id,
  frequencyWeeks,
  nextShipAt,
  variantId,
  size,
  variants,
}: {
  id: string;
  frequencyWeeks: number;
  nextShipAt: string; // yyyy-mm-dd
  variantId: string | null;
  size: string;
  variants: Variant[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [freq, setFreq] = useState(String(frequencyWeeks));
  const [date, setDate] = useState(nextShipAt);
  const [variant, setVariant] = useState(
    variantId ?? variants.find((v) => v.size === size)?.id ?? "",
  );
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  function submit() {
    setErrors({});
    start(async () => {
      const res = await updateSubscription(id, {
        frequencyWeeks: freq,
        nextShipAt: date,
        variantId: variant || undefined,
      });
      if (res.ok) {
        toast("Schedule updated", "success");
        router.refresh();
      } else {
        setErrors(res.fieldErrors ?? {});
        toast(res.error ?? "Could not update", "error");
      }
    });
  }

  return (
    <form
      className="card grid gap-4 p-5"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <h2 className="label">Edit schedule</h2>

      <div>
        <label className="label">Ship every (weeks)</label>
        <input
          className="input"
          inputMode="numeric"
          value={freq}
          onChange={(e) => setFreq(e.target.value)}
        />
        {errors.frequencyWeeks?.[0] && (
          <p className="mt-1 text-xs text-negative">{errors.frequencyWeeks[0]}</p>
        )}
      </div>

      <div>
        <label className="label">Next ship date</label>
        <input
          type="date"
          className="input"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        {errors.nextShipAt?.[0] && (
          <p className="mt-1 text-xs text-negative">{errors.nextShipAt[0]}</p>
        )}
      </div>

      {variants.length > 0 && (
        <div>
          <label className="label">Tea weight</label>
          <select
            className="select"
            value={variant}
            onChange={(e) => setVariant(e.target.value)}
          >
            {variants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.size} ({v.stock} in stock)
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <button
          type="submit"
          className={cn("btn btn-primary btn-sm", pending && "opacity-60")}
          disabled={pending}
        >
          {pending ? "Saving…" : "Save schedule"}
        </button>
      </div>
    </form>
  );
}
