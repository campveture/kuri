"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveCollection } from "@/app/admin/collections/actions";
import { toast } from "@/components/ui/toaster";
import { ImageUploader } from "@/components/admin/image-uploader";
import { cn } from "@/lib/utils";

type PickProduct = { id: string; name: string; category: string; image: string };

export type CollectionValues = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  active: boolean;
  productIds: string[];
};

export function CollectionForm({
  allProducts,
  initial,
}: {
  allProducts: PickProduct[];
  initial?: Partial<CollectionValues>;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [v, setV] = useState<CollectionValues>({
    name: "",
    slug: "",
    description: "",
    image: "",
    active: true,
    productIds: [],
    ...initial,
  });
  const [q, setQ] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const set = <K extends keyof CollectionValues>(k: K, val: CollectionValues[K]) =>
    setV((p) => ({ ...p, [k]: val }));

  const selected = new Set(v.productIds);
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return allProducts.filter(
      (p) =>
        !term ||
        p.name.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term),
    );
  }, [allProducts, q]);

  function toggleProduct(id: string) {
    setV((p) => ({
      ...p,
      productIds: p.productIds.includes(id)
        ? p.productIds.filter((x) => x !== id)
        : [...p.productIds, id],
    }));
  }

  function submit() {
    setErrors({});
    start(async () => {
      const res = await saveCollection({
        id: v.id,
        name: v.name,
        slug: v.slug,
        description: v.description,
        image: v.image,
        active: v.active,
        productIds: v.productIds,
      });
      if (res.ok) {
        toast(v.id ? "Collection updated" : "Collection created", "success");
        router.push("/admin/collections");
        router.refresh();
      } else {
        setErrors(res.fieldErrors ?? {});
        toast(res.error ?? "Could not save", "error");
      }
    });
  }

  return (
    <form
      className="max-w-3xl space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div className="card grid gap-4 p-5">
        <div>
          <label className="label" htmlFor="coll-name">Name</label>
          <input
            id="coll-name"
            className="input"
            value={v.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Summer Drop"
            required
          />
          {errors.name?.[0] && (
            <p className="mt-1 text-xs text-negative">{errors.name[0]}</p>
          )}
        </div>
        <div>
          <label className="label" htmlFor="coll-slug">Slug (optional)</label>
          <input
            id="coll-slug"
            className="input"
            placeholder="auto from name"
            value={v.slug}
            onChange={(e) => set("slug", e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="coll-description">Description</label>
          <textarea
            id="coll-description"
            className="textarea min-h-20"
            value={v.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>
        <div>
          <ImageUploader
            label="Collection image (optional)"
            value={v.image ? [v.image] : []}
            onChange={(next) => set("image", next[0] ?? "")}
            max={1}
            hint="Shown on the collection's own page and where it's featured."
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={v.active}
            onChange={(e) => set("active", e.target.checked)}
          />
          Active (visible on the storefront)
        </label>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between">
          <p className="label">Teas ({v.productIds.length})</p>
          <input
            className="input w-48 py-1.5 text-xs"
            placeholder="Filter…"
            aria-label="Filter teas"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="mt-3 max-h-80 space-y-1 overflow-y-auto">
          {filtered.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => toggleProduct(p.id)}
              className={cn(
                "flex w-full items-center gap-3 border px-2 py-1.5 text-left text-sm",
                selected.has(p.id)
                  ? "border-gold-deep bg-cream-2"
                  : "border-line hover:border-gold-deep",
              )}
            >
              <span
                className={cn(
                  "h-3.5 w-3.5 shrink-0 border",
                  selected.has(p.id)
                    ? "border-gold-deep bg-gold-deep"
                    : "border-line",
                )}
              />
              <div className="h-8 w-8 shrink-0 overflow-hidden border border-line bg-cream-2">
                {p.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <span className="flex-1">{p.name}</span>
              <span className="text-xs text-muted-2">{p.category}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="p-2 text-xs text-muted-2">No teas match.</p>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Saving…" : v.id ? "Save changes" : "Create collection"}
        </button>
        <Link href="/admin/collections" className="btn btn-outline">
          Cancel
        </Link>
      </div>
    </form>
  );
}
