"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveProduct } from "@/app/admin/actions";
import { toast } from "@/components/ui/toaster";
import { ImageUploader } from "@/components/admin/image-uploader";
import { cn } from "@/lib/utils";

type Category = { id: string; name: string };
type Variant = { size: string; stock: string };

export type ProductFormValues = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  compareAtPrice: string;
  costPrice: string;
  subscribePrice: string;
  categoryId: string;
  images: string[];
  tags: string;
  featured: boolean;
  active: boolean;
  tastingNotes: string; // comma-separated in the form
  origin: string;
  altitude: string;
  process: string;
  harvest: string;
  brewTemp: string;
  brewDose: string;
  brewSteep: string;
  brewBestWith: string;
  accent: string;
  accentDark: string;
  variants: Variant[];
};

const EMPTY: ProductFormValues = {
  name: "",
  slug: "",
  description: "",
  price: "",
  compareAtPrice: "",
  costPrice: "",
  subscribePrice: "",
  categoryId: "",
  images: [],
  tags: "",
  featured: false,
  active: true,
  tastingNotes: "",
  origin: "Kuri Valley Estate, Sreemangal",
  altitude: "",
  process: "",
  harvest: "",
  brewTemp: "",
  brewDose: "",
  brewSteep: "",
  brewBestWith: "",
  accent: "#C89A3E",
  accentDark: "#A97F2E",
  variants: [
    { size: "50g", stock: "0" },
    { size: "100g", stock: "0" },
    { size: "250g", stock: "0" },
  ],
};

export function ProductForm({
  categories,
  initial,
}: {
  categories: Category[];
  initial?: Partial<ProductFormValues>;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [v, setV] = useState<ProductFormValues>({
    ...EMPTY,
    ...initial,
    categoryId: initial?.categoryId || categories[0]?.id || "",
    variants: initial?.variants?.length ? initial.variants : EMPTY.variants,
    images: initial?.images ?? [],
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const set = <K extends keyof ProductFormValues>(k: K, val: ProductFormValues[K]) =>
    setV((p) => ({ ...p, [k]: val }));

  function submit() {
    setErrors({});
    start(async () => {
      const res = await saveProduct({
        id: v.id,
        name: v.name,
        slug: v.slug,
        description: v.description,
        price: v.price,
        compareAtPrice: v.compareAtPrice || undefined,
        costPrice: v.costPrice || "0",
        subscribePrice: v.subscribePrice || undefined,
        categoryId: v.categoryId,
        images: v.images,
        tags: v.tags,
        featured: v.featured,
        active: v.active,
        tastingNotes: v.tastingNotes
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        origin: v.origin,
        altitude: v.altitude,
        process: v.process,
        harvest: v.harvest,
        brewTemp: v.brewTemp,
        brewDose: v.brewDose,
        brewSteep: v.brewSteep,
        brewBestWith: v.brewBestWith,
        accent: v.accent,
        accentDark: v.accentDark,
        variants: v.variants
          .filter((x) => x.size.trim())
          .map((x) => ({ size: x.size.trim(), stock: x.stock || "0" })),
      });
      if (res.ok) {
        toast(v.id ? "Tea updated" : "Tea created", "success");
        router.push("/admin/products");
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
          <label className="label" htmlFor="prod-name">Name</label>
          <input id="prod-name" className="input" value={v.name} onChange={(e) => set("name", e.target.value)} required />
          <Err e={errors.name} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="prod-slug">Slug (optional)</label>
            <input id="prod-slug" className="input" placeholder="auto from name" value={v.slug} onChange={(e) => set("slug", e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="prod-category">Category</label>
            <select id="prod-category" className="select" value={v.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <Err e={errors.categoryId} />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="prod-description">Description</label>
          <textarea id="prod-description" className="textarea" value={v.description} onChange={(e) => set("description", e.target.value)} required />
          <Err e={errors.description} />
        </div>
        <div className="grid gap-4 sm:grid-cols-4">
          <Field id="prod-price" label="Price (৳)" value={v.price} onChange={(x) => set("price", x)} err={errors.price} required />
          <Field id="prod-compare-at" label="Compare-at (৳)" value={v.compareAtPrice} onChange={(x) => set("compareAtPrice", x)} />
          <Field id="prod-cost-price" label="Cost / unit (৳)" value={v.costPrice} onChange={(x) => set("costPrice", x)} placeholder="0" hint="For profit reports." />
          <Field id="prod-subscribe-price" label="Subscribe price (৳)" value={v.subscribePrice} onChange={(x) => set("subscribePrice", x)} hint="Blank = no subscription." />
        </div>
        <div>
          <label className="label" htmlFor="prod-tags">Tags (comma sep.)</label>
          <input id="prod-tags" className="input" value={v.tags} onChange={(e) => set("tags", e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={v.featured} onChange={(e) => set("featured", e.target.checked)} />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={v.active} onChange={(e) => set("active", e.target.checked)} />
            Active (visible in shop)
          </label>
        </div>
      </div>

      <div className="card grid gap-4 p-5">
        <p className="label">Tea detail</p>
        <div>
          <label className="label" htmlFor="prod-tasting-notes">Tasting notes (comma sep.)</label>
          <input id="prod-tasting-notes" className="input" placeholder="Malt, Honey, Stone Fruit" value={v.tastingNotes} onChange={(e) => set("tastingNotes", e.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="prod-origin" label="Origin" value={v.origin} onChange={(x) => set("origin", x)} />
          <Field id="prod-altitude" label="Altitude" value={v.altitude} onChange={(x) => set("altitude", x)} placeholder="900 m" />
          <Field id="prod-process" label="Process" value={v.process} onChange={(x) => set("process", x)} placeholder="Orthodox, fully oxidised" />
          <Field id="prod-harvest" label="Harvest" value={v.harvest} onChange={(x) => set("harvest", x)} placeholder="Second Flush" />
        </div>
        <div className="grid gap-4 sm:grid-cols-4">
          <Field id="prod-brew-temp" label="Brew temp" value={v.brewTemp} onChange={(x) => set("brewTemp", x)} placeholder="95°C" />
          <Field id="prod-brew-dose" label="Brew dose" value={v.brewDose} onChange={(x) => set("brewDose", x)} placeholder="3g / 200ml" />
          <Field id="prod-brew-steep" label="Steep time" value={v.brewSteep} onChange={(x) => set("brewSteep", x)} placeholder="3–4 min" />
          <Field id="prod-brew-best-with" label="Best with" value={v.brewBestWith} onChange={(x) => set("brewBestWith", x)} placeholder="A splash of milk" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="prod-accent">Pouch colour</label>
            <div className="flex items-center gap-2">
              <input type="color" aria-label="Pouch colour picker" value={v.accent} onChange={(e) => set("accent", e.target.value)} className="h-9 w-12 rounded border border-line" />
              <input id="prod-accent" className="input" value={v.accent} onChange={(e) => set("accent", e.target.value)} />
            </div>
            <Err e={errors.accent} />
          </div>
          <div>
            <label className="label" htmlFor="prod-accent-dark">Pouch shadow colour</label>
            <div className="flex items-center gap-2">
              <input type="color" aria-label="Pouch shadow colour picker" value={v.accentDark} onChange={(e) => set("accentDark", e.target.value)} className="h-9 w-12 rounded border border-line" />
              <input id="prod-accent-dark" className="input" value={v.accentDark} onChange={(e) => set("accentDark", e.target.value)} />
            </div>
            <Err e={errors.accentDark} />
          </div>
        </div>
      </div>

      <div className="card p-5">
        <ImageUploader
          label="Photos (optional)"
          value={v.images}
          onChange={(next) => set("images", next)}
          max={6}
          hint="Leave empty to show the illustrated pouch. Add real photography once it exists."
        />
        <Err e={errors.images} />
      </div>

      <div className="card p-5">
        <p className="label">Weights & stock</p>
        <div className="space-y-2">
          {v.variants.map((vr, i) => (
            <div key={i} className="flex gap-2">
              <input
                className="input w-28 py-2 text-sm"
                placeholder="Weight"
                aria-label={`Weight, row ${i + 1}`}
                value={vr.size}
                onChange={(e) => {
                  const next = [...v.variants];
                  next[i] = { ...next[i], size: e.target.value };
                  set("variants", next);
                }}
              />
              <input
                className="input w-28 py-2 text-sm"
                inputMode="numeric"
                placeholder="Stock"
                aria-label={`Stock, row ${i + 1}`}
                value={vr.stock}
                onChange={(e) => {
                  const next = [...v.variants];
                  next[i] = { ...next[i], stock: e.target.value };
                  set("variants", next);
                }}
              />
              <button
                type="button"
                className="px-3 text-muted-2 hover:text-negative"
                aria-label={`Remove weight, row ${i + 1}`}
                onClick={() => set("variants", v.variants.filter((_, idx) => idx !== i))}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="btn btn-outline btn-sm mt-3"
          onClick={() => set("variants", [...v.variants, { size: "", stock: "0" }])}
        >
          + Add weight
        </button>
        <Err e={errors.variants} />
      </div>

      <div className="flex gap-3">
        <button type="submit" className={cn("btn btn-primary", pending && "opacity-60")} disabled={pending}>
          {pending ? "Saving…" : v.id ? "Save changes" : "Create tea"}
        </button>
        <Link href="/admin/products" className="btn btn-outline">Cancel</Link>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  err,
  required,
  placeholder,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  err?: string[];
  required?: boolean;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div>
      <label className="label" htmlFor={id}>{label}</label>
      <input
        id={id}
        className="input"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
      {hint && <p className="mt-1 text-[11px] text-muted-2">{hint}</p>}
      <Err e={err} />
    </div>
  );
}

function Err({ e }: { e?: string[] }) {
  if (!e?.length) return null;
  return <p className="mt-1 text-xs text-negative">{e[0]}</p>;
}
