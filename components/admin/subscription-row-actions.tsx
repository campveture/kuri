"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  advanceSubscription,
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
} from "@/app/admin/subscriptions/actions";
import { toast } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

export function SubscriptionRowActions({
  id,
  status,
  due,
}: {
  id: string;
  status: "ACTIVE" | "PAUSED" | "CANCELLED";
  due: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const run = (fn: () => Promise<{ ok?: boolean; error?: string; orderNumber?: string }>, okMsg: string) =>
    start(async () => {
      const res = await fn();
      if (res?.error) toast(res.error, "error");
      else {
        toast(res?.orderNumber ? `${okMsg} (${res.orderNumber})` : okMsg, "success");
        router.refresh();
      }
    });

  return (
    <div className="inline-flex flex-wrap items-center gap-2 text-xs">
      {due && status === "ACTIVE" && (
        <button
          disabled={pending}
          onClick={() => run(() => advanceSubscription(id), "Order generated")}
          className={cn("btn btn-primary btn-sm", pending && "opacity-60")}
        >
          Generate next order
        </button>
      )}
      {status === "ACTIVE" && (
        <button
          disabled={pending}
          onClick={() => run(() => pauseSubscription(id), "Subscription paused")}
          className="text-muted-2 hover:text-charcoal disabled:opacity-40"
        >
          Pause
        </button>
      )}
      {status === "PAUSED" && (
        <button
          disabled={pending}
          onClick={() => run(() => resumeSubscription(id), "Subscription resumed")}
          className="text-gold-deep hover:underline disabled:opacity-40"
        >
          Resume
        </button>
      )}
      {status !== "CANCELLED" && (
        <button
          disabled={pending}
          onClick={() => {
            if (!confirm("Cancel this subscription? It cannot be reactivated.")) return;
            run(() => cancelSubscription(id), "Subscription cancelled");
          }}
          className="text-negative hover:underline disabled:opacity-40"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
