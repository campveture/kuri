"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleProductActive, deleteProduct } from "@/app/admin/actions";
import { toast } from "@/components/ui/toaster";

export function ProductRowActions({ id, active }: { id: string; active: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <div className="inline-flex items-center gap-3 text-xs">
      <Link href={`/admin/products/${id}`} className="text-gold-deep hover:underline">
        Edit
      </Link>
      <button
        disabled={pending}
        onClick={() =>
          start(async () => {
            await toggleProductActive(id, !active);
            toast(active ? "Hidden from store" : "Now live", "success");
            router.refresh();
          })
        }
        className="text-muted-2 hover:text-charcoal disabled:opacity-40"
      >
        {active ? "Hide" : "Show"}
      </button>
      <button
        disabled={pending}
        onClick={() => {
          if (!confirm("Delete this tea? If it has orders it will just be hidden.")) return;
          start(async () => {
            const res = await deleteProduct(id);
            toast(res.softDeleted ? "Has orders — hidden instead" : "Tea deleted", "success");
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
