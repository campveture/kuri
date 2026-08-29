"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleLocation, deleteLocation } from "@/app/admin/stores/actions";
import { toast } from "@/components/ui/toaster";

export function StoreRowActions({ id, active }: { id: string; active: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <div className="flex justify-end gap-3 text-xs">
      <button
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await toggleLocation(id, !active);
            if (r.ok) router.refresh();
            else toast(r.error, "error");
          })
        }
        className="text-gold-deep hover:underline disabled:opacity-40"
      >
        {active ? "Disable" : "Enable"}
      </button>
      <button
        disabled={pending}
        onClick={() => {
          if (!confirm("Delete this store?")) return;
          start(async () => {
            const r = await deleteLocation(id);
            if (r.ok) router.refresh();
            else toast(r.error, "error");
          });
        }}
        className="text-negative hover:underline disabled:opacity-40"
      >
        Delete
      </button>
    </div>
  );
}
