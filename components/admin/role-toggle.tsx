"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setUserRole } from "@/app/admin/actions";
import { toast } from "@/components/ui/toaster";

export function RoleToggle({
  userId,
  role,
}: {
  userId: string;
  role: "CUSTOMER" | "ADMIN";
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const next = role === "ADMIN" ? "CUSTOMER" : "ADMIN";

  return (
    <button
      disabled={pending}
      onClick={() => {
        if (!confirm(`Change this user's role to ${next}?`)) return;
        start(async () => {
          const res = await setUserRole(userId, next);
          if (res.error) toast(res.error, "error");
          else {
            toast(`Role set to ${next}`, "success");
            router.refresh();
          }
        });
      }}
      className="btn btn-outline btn-sm disabled:opacity-40"
    >
      {pending ? "…" : `Make ${next}`}
    </button>
  );
}
