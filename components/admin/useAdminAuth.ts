"use client";

import { useEffect, useState } from "react";

const SESSION_KEY = "kuri_admin_session";

export function useAdminAuth() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) {
        window.location.href = (process.env.NEXT_PUBLIC_BASE_PATH || "") + "/admin/login";
        return;
      }
      const s = JSON.parse(raw);
      if (Date.now() > s.expiresAt) {
        localStorage.removeItem(SESSION_KEY);
        window.location.href = (process.env.NEXT_PUBLIC_BASE_PATH || "") + "/admin/login";
        return;
      }
      setAuthed(true);
    } catch {
      window.location.href = (process.env.NEXT_PUBLIC_BASE_PATH || "") + "/admin/login";
    }
  }, []);

  return authed;
}
