"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setFulfillment } from "@/app/admin/actions";
import { toast } from "@/components/ui/toaster";

const COURIERS = [
  "Pathao",
  "Steadfast",
  "RedX",
  "Sundarban",
  "eCourier",
  "Paperfly",
  "SA Paribahan",
  "Self / pickup",
];

export function FulfillmentControls({
  orderId,
  courier,
  trackingCode,
}: {
  orderId: string;
  courier: string | null;
  trackingCode: string | null;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [c, setC] = useState(courier ?? "");
  const [t, setT] = useState(trackingCode ?? "");

  return (
    <section className="card space-y-3 p-5">
      <h2 className="label">Shipment</h2>

      <div>
        <label className="label">Courier</label>
        <input
          list="courier-list"
          value={c}
          onChange={(e) => setC(e.target.value)}
          className="input text-sm"
          placeholder="Pathao, Steadfast…"
        />
        <datalist id="courier-list">
          {COURIERS.map((x) => (
            <option key={x} value={x} />
          ))}
        </datalist>
      </div>

      <div>
        <label className="label">Tracking / consignment #</label>
        <input
          value={t}
          onChange={(e) => setT(e.target.value)}
          className="input text-sm"
        />
      </div>

      <button
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await setFulfillment(orderId, c, t);
            if ("error" in res && res.error) {
              toast(String(res.error), "error");
              return;
            }
            toast("Shipment saved", "success");
            router.refresh();
          })
        }
        className="btn btn-sm btn-ghost w-full"
      >
        {pending ? "Saving…" : "Save shipment"}
      </button>
      <p className="text-xs text-muted-2">
        Shown to the customer on their tracking page.
      </p>
    </section>
  );
}
