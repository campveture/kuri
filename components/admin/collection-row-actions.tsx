"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  toggleCollection,
  deleteCollection,
} from "@/app/admin/collections/actions";
import { toast } from "@/components/ui/toaster";

export function CollectionRowActions({
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
        href={`/admin/collections/${id}`}
        className="text-gold-deep hover:underline"
      >
        Edit
      </Link>
      <button
        disabled={pending}
        onClick={() =>
          start(async () => {
            await toggleCollection(id, !active);
            toast(active ? "Hidden" : "Visible", "success");
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
          if (!confirm("Delete this collection? (teas are not deleted)")) return;
          start(async () => {
            await deleteCollection(id);
            toast("Collection deleted", "success");
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
