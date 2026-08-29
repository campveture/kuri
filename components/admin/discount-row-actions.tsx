"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleDiscount, deleteDiscount } from "@/app/admin/discounts/actions";
import { toast } from "@/components/ui/toaster";

export function DiscountRowActions({
  id,
  active,
}: {
  id: string;
  active: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <div className="inline-flex items-center gap-3 text-xs">
      <Link
        href={`/admin/discounts/${id}`}
        className="text-gold-deep hover:underline"
      >
        Edit
      </Link>
      <button
        disabled={pending}
        onClick={() =>
          start(async () => {
            await toggleDiscount(id, !active);
            toast(active ? "Disabled" : "Enabled", "success");
            router.refresh();
          })
        }
        className="text-muted-2 hover:text-charcoal disabled:opacity-40"
      >
        {active ? "Disable" : "Enable"}
      </button>
      <button
        disabled={pending}
        onClick={() => {
          if (!confirm("Delete this discount?")) return;
          start(async () => {
            const res = await deleteDiscount(id);
            toast(
              res.softDeleted ? "Used on orders — disabled instead" : "Deleted",
              "success",
            );
            router.refresh();
          });
        }}
        className="text-negative hover:underline disabled:opacity-40"
      >
        Delete
      </button>
    </div>
  );
}
