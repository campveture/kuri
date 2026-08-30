"use client";

import { useRef, useState } from "react";
import { toast } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

/**
 * Reusable admin image picker. Uploads through /api/admin/upload and returns the
 * stored URLs to the parent via `onChange`.
 */
export function ImageUploader({
  value,
  onChange,
  max = 6,
  label = "Images",
  hint,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  max?: number;
  label?: string;
  hint?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [manual, setManual] = useState("");

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    try {
      const room = Math.max(0, max - value.length);
      for (const file of Array.from(files).slice(0, room)) {
        const fd = new FormData();
        fd.append("file", file);
        let data: { url?: string; error?: string } = {};
        try {
          const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
          data = await res.json().catch(() => ({}));
          if (!res.ok || !data.url) {
            toast(data.error ?? `Upload failed (${res.status})`, "error");
            continue;
          }
        } catch {
          toast("Upload failed — check your connection.", "error");
          continue;
        }
        onChange([...value, data.url]);
      }
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function move(i: number, dir: -1 | 1) {
    const next = [...value];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  const full = value.length >= max;

  return (
    <div>
      {label && <p className="label">{label}</p>}
      <div className="flex flex-wrap gap-3">
        {value.map((src, i) => (
          <div
            key={src + i}
            className="group relative h-24 w-24 overflow-hidden border border-line bg-cream-2"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-charcoal/80 text-[11px]">
              <button type="button" onClick={() => move(i, -1)} className="px-1.5 py-0.5 text-cream" aria-label="Move left">‹</button>
              <button type="button" onClick={() => onChange(value.filter((_, k) => k !== i))} className="px-1.5 py-0.5 text-cream" aria-label="Remove">✕</button>
              <button type="button" onClick={() => move(i, 1)} className="px-1.5 py-0.5 text-cream" aria-label="Move right">›</button>
            </div>
          </div>
        ))}
        {!full && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className={cn(
              "flex h-24 w-24 flex-col items-center justify-center border border-dashed border-line text-xs text-muted-2 hover:border-gold-deep hover:text-gold-deep",
              busy && "opacity-50",
            )}
          >
            {busy ? "Uploading…" : "+ Upload"}
          </button>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple={max > 1}
        hidden
        onChange={(e) => upload(e.target.files)}
      />
      {!full && (
        <div className="mt-2 flex gap-2">
          <input
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            placeholder="…or paste an image URL / path"
            className="input flex-1 py-2 text-xs"
          />
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => {
              const u = manual.trim();
              if (u) {
                onChange([...value, u]);
                setManual("");
              }
            }}
          >
            Add
          </button>
        </div>
      )}
      {hint && <p className="mt-1 text-xs text-muted-2">{hint}</p>}
    </div>
  );
}
