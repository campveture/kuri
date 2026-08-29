"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CloseIcon, SearchIcon } from "@/components/Icons";
import { formatBDT } from "@/lib/utils";

type Item = {
  slug: string;
  name: string;
  category: string;
  tastingNotes: string[];
  price: number;
  inStock: boolean;
};

export function SearchOverlay({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      return;
    }
    if (items.length === 0) {
      fetch("/api/products")
        .then((r) => r.json())
        .then((data: Item[]) => setItems(Array.isArray(data) ? data : []))
        .catch(() => {});
    }
  }, [isOpen, items.length]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return items.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tastingNotes.some((n) => n.toLowerCase().includes(q)),
    );
  }, [query, items]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-cream">
      <div className="wrap flex items-center gap-4 border-b border-line py-6">
        <SearchIcon size={20} />
        <input
          autoFocus
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search teas, notes, categories..."
          className="flex-1 bg-transparent font-serif text-2xl outline-none placeholder:text-muted-2"
        />
        <button type="button" onClick={onClose} aria-label="Close search">
          <CloseIcon />
        </button>
      </div>

      <div className="wrap py-10">
        {query.trim() === "" ? (
          <p className="text-sm text-muted-2">Start typing to search by name, category, or tasting note.</p>
        ) : results.length === 0 ? (
          <p className="text-sm text-muted-2">No teas match &ldquo;{query}&rdquo;.</p>
        ) : (
          <div className="flex flex-col gap-1">
            {results.map((p) => (
              <Link
                key={p.slug}
                href={`/shop/${p.slug}`}
                onClick={onClose}
                className="flex items-center justify-between border-b border-line py-4"
              >
                <div>
                  <div className="font-serif text-lg">{p.name}</div>
                  <div className="mt-1 text-xs text-muted-2">
                    {p.category} &middot; {p.tastingNotes.join(", ")}
                  </div>
                </div>
                <div className="text-sm font-semibold">
                  {p.inStock ? `From ${formatBDT(p.price)}` : "Sold out"}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
