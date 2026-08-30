"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type ToastKind = "success" | "error" | "info";
type Toast = { id: number; title: string; kind: ToastKind };

const EVENT = "kuri:toast";
let counter = 0;

export function toast(title: string, kind: ToastKind = "info") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(EVENT, { detail: { id: ++counter, title, kind } }),
  );
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    function onToast(e: Event) {
      const t = (e as CustomEvent).detail as Toast;
      setToasts((prev) => [...prev, t]);
      setTimeout(
        () => setToasts((prev) => prev.filter((x) => x.id !== t.id)),
        3200,
      );
    }
    window.addEventListener(EVENT, onToast);
    return () => window.removeEventListener(EVENT, onToast);
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4"
      role="status"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role={t.kind === "error" ? "alert" : undefined}
          className={cn(
            "pointer-events-auto flex items-center gap-3 border px-4 py-3 text-sm font-medium shadow-lg",
            t.kind === "success" && "border-gold-deep bg-charcoal text-cream",
            t.kind === "error" && "border-[#b03636] bg-charcoal text-cream",
            t.kind === "info" && "border-line bg-charcoal text-cream",
          )}
        >
          {t.title}
        </div>
      ))}
    </div>
  );
}
