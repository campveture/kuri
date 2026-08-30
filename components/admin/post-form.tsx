"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { savePost } from "@/app/admin/journal/actions";
import { toast } from "@/components/ui/toaster";
import { ImageUploader } from "@/components/admin/image-uploader";
import { cn } from "@/lib/utils";

export type PostFormValues = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  body: string[];
  coverImage: string;
  status: "DRAFT" | "PUBLISHED";
};

const EMPTY: PostFormValues = {
  title: "",
  slug: "",
  excerpt: "",
  category: "",
  body: [""],
  coverImage: "",
  status: "DRAFT",
};

export function PostForm({ initial }: { initial?: Partial<PostFormValues> }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [v, setV] = useState<PostFormValues>({
    ...EMPTY,
    ...initial,
    body: initial?.body?.length ? initial.body : EMPTY.body,
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const set = <K extends keyof PostFormValues>(k: K, val: PostFormValues[K]) =>
    setV((p) => ({ ...p, [k]: val }));

  function setParagraph(i: number, text: string) {
    const next = [...v.body];
    next[i] = text;
    set("body", next);
  }
  function addParagraph() {
    set("body", [...v.body, ""]);
  }
  function removeParagraph(i: number) {
    if (v.body.length <= 1) {
      set("body", [""]);
      return;
    }
    set("body", v.body.filter((_, idx) => idx !== i));
  }
  function moveParagraph(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= v.body.length) return;
    const next = [...v.body];
    [next[i], next[j]] = [next[j], next[i]];
    set("body", next);
  }

  function submit() {
    setErrors({});
    start(async () => {
      const res = await savePost({
        id: v.id,
        title: v.title,
        slug: v.slug || undefined,
        excerpt: v.excerpt,
        category: v.category,
        body: v.body.map((p) => p.trim()).filter(Boolean),
        coverImage: v.coverImage || undefined,
        status: v.status,
      });
      if (res.ok) {
        toast(v.id ? "Journal entry updated" : "Journal entry created", "success");
        router.push("/admin/journal");
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
          <label className="label" htmlFor="pf-title">Title</label>
          <input
            id="pf-title"
            className="input"
            value={v.title}
            onChange={(e) => set("title", e.target.value)}
            required
          />
          <Err e={errors.title} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="pf-slug">Slug (optional)</label>
            <input
              id="pf-slug"
              className="input"
              placeholder="auto from title"
              value={v.slug}
              onChange={(e) => set("slug", e.target.value)}
            />
            <Err e={errors.slug} />
          </div>
          <div>
            <label className="label" htmlFor="pf-category">Category</label>
            <input
              id="pf-category"
              className="input"
              placeholder="Brewing, Origin, Dispatch…"
              value={v.category}
              onChange={(e) => set("category", e.target.value)}
              required
            />
            <Err e={errors.category} />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="pf-excerpt">Excerpt</label>
          <textarea
            id="pf-excerpt"
            className="textarea"
            value={v.excerpt}
            onChange={(e) => set("excerpt", e.target.value)}
            required
          />
          <p className="mt-1 text-[11px] text-muted-2">
            Shown on the Journal index card. 10–400 characters.
          </p>
          <Err e={errors.excerpt} />
        </div>

        <div>
          <label className="label" htmlFor="pf-status">Status</label>
          <select
            id="pf-status"
            className="select"
            value={v.status}
            onChange={(e) =>
              set("status", e.target.value as PostFormValues["status"])
            }
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </select>
        </div>
      </div>

      <div className="card p-5">
        <ImageUploader
          label="Cover image (optional)"
          value={v.coverImage ? [v.coverImage] : []}
          onChange={(next) => set("coverImage", next[0] ?? "")}
          max={1}
          hint="Used at the top of the article and on the Journal index. Falls back to a default photo if empty."
        />
        <Err e={errors.coverImage} />
      </div>

      <div className="card p-5">
        <span className="label">Body</span>
        <p className="mb-3 text-[11px] text-muted-2">
          One paragraph per box. Use the arrows to reorder.
        </p>
        <div className="space-y-3">
          {/* index key ok: textareas are controlled from state, no internal state */}
          {v.body.map((para, i) => (
            <div key={i} className="flex gap-2">
              <textarea
                className="textarea flex-1"
                rows={3}
                value={para}
                placeholder={`Paragraph ${i + 1}`}
                aria-label={`Paragraph ${i + 1}`}
                onChange={(e) => setParagraph(i, e.target.value)}
              />
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  className="px-2 text-muted-2 hover:text-gold-deep disabled:opacity-30"
                  disabled={i === 0}
                  onClick={() => moveParagraph(i, -1)}
                  aria-label="Move up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="px-2 text-muted-2 hover:text-gold-deep disabled:opacity-30"
                  disabled={i === v.body.length - 1}
                  onClick={() => moveParagraph(i, 1)}
                  aria-label="Move down"
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="px-2 text-muted-2 hover:text-negative"
                  onClick={() => removeParagraph(i)}
                  aria-label="Remove paragraph"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="btn btn-outline btn-sm mt-3"
          onClick={addParagraph}
        >
          + Add paragraph
        </button>
        <Err e={errors.body} />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className={cn("btn btn-primary", pending && "opacity-60")}
          disabled={pending}
        >
          {pending ? "Saving…" : v.id ? "Save changes" : "Create entry"}
        </button>
        <Link href="/admin/journal" className="btn btn-outline">
          Cancel
        </Link>
      </div>
    </form>
  );
}

function Err({ e }: { e?: string[] }) {
  if (!e?.length) return null;
  return <p className="mt-1 text-xs text-negative">{e[0]}</p>;
}
