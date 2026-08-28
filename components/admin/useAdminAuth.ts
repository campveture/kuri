import { isLoggedIn } from "@/lib/admin-auth";
import { useEffect } from "react";

export function useRequireAuth() {
  const base = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/+$/, "");
  useEffect(() => {
    if (!isLoggedIn()) window.location.href = base + "/admin/login";
  }, [base]);
}
