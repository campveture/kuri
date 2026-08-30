"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { savePage, deletePage } from "@/app/admin/pages/actions";
import { toast } from "@/components/ui/toaster";
import { ImageUploader } from "@/components/admin/image-uploader";
import { cn } from "@/lib/utils";
import {
  BLOCK_META,
  BLOCK_ORDER,
  defaultBlock,
  parseBlocks,
  type Block,
  type BlockType,
  type Field,
} from "@/lib/blocks";

type PageRow = {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
  isHome: boolean;
  blocks: string;
  seoTitle: string | null;
  seoDescription: string | null;
};

export function PageBuilder({
  page,
  collections,
}: {
  page: PageRow;
  collections: { name: string; slug: string }[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [title, setTitle] = useState(page.title);
  const [slug, setSlug] = useState(page.slug);
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(page.status);
  const [seoTitle, setSeoTitle] = useState(page.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(page.seoDescription ?? "");
  const [blocks, setBlocks] = useState<Block[]>(parseBlocks(page.blocks));
  const [addType, setAddType] = useState<BlockType>("hero");

  const liveHref = page.isHome ? "/" : `/${slug}`;

  function patch(id: string, name: string, value: unknown) {
    setBlocks((bs) =>
      bs.map((b) => (b.id === id ? ({ ...b, [name]: value } as Block) : b)),
    );
  }
  function move(i: number, dir: -1 | 1) {
    setBlocks((bs) => {
      const next = [...bs];
      const j = i + dir;
      if (j < 0 || j >= next.length) return bs;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }
  function remove(id: string) {
    setBlocks((bs) => bs.filter((b) => b.id !== id));
  }
  function add() {
    setBlocks((bs) => [...bs, defaultBlock(addType)]);
  }

  function save() {
    start(async () => {
      const res = await savePage(page.id, {
        title,
        slug,
        status,
        blocks,
        seoTitle,
        seoDescription,
      });
      if (res.ok) {
        toast("Page saved", "success");
        router.refresh();
      } else {
        toast(res.error, "error");
      }
    });
  }

  function onDelete() {
    if (!confirm("Delete this page? This cannot be undone.")) return;
    start(async () => {
      const res = await deletePage(page.id);
      if (res.ok) {
        toast("Page deleted", "success");
        router.push("/admin/pages");
        router.refresh();
      } else {
        toast(res.error, "error");
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="card space-y-4 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="pb-title">Page title</label>
            <input
              id="pb-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
            />
          </div>
          {page.isHome ? (
            <div>
              <span className="label">URL</span>
              <p className="text-sm text-muted-2">This is the homepage.</p>
            </div>
          ) : (
            <div>
              <label className="label" htmlFor="pb-slug">URL slug</label>
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-2">/</span>
                <input
                  id="pb-slug"
                  value={slug}
                  placeholder="eid-drop"
                  onChange={(e) => setSlug(e.target.value)}
                  className="input"
                />
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {!page.isHome && (
            <select
              aria-label="Publish status"
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as "DRAFT" | "PUBLISHED")
              }
              className="select w-auto py-2 text-xs"
            >
              <option value="DRAFT">Draft (hidden)</option>
              <option value="PUBLISHED">Published (live)</option>
            </select>
          )}
          <Link
            href={liveHref}
            target="_blank"
            className="btn btn-outline btn-sm"
          >
            ↗ Open
          </Link>
          <button
            onClick={save}
            disabled={pending}
            className={cn("btn btn-primary btn-sm", pending && "opacity-60")}
          >
            {pending ? "Saving…" : "Save page"}
          </button>
          {!page.isHome && (
            <button
              onClick={onDelete}
              disabled={pending}
              className="btn btn-sm btn-ghost text-negative"
            >
              Delete
            </button>
          )}
        </div>
        <details className="text-sm">
          <summary className="cursor-pointer text-xs uppercase tracking-[0.14em] text-muted-2">
            SEO
          </summary>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <input
              aria-label="SEO title"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder="SEO title"
              className="input"
            />
            <input
              aria-label="SEO description"
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              placeholder="SEO description"
              className="input"
            />
          </div>
        </details>
      </div>

      {/* blocks */}
      {blocks.length === 0 && (
        <p className="border border-dashed border-line p-8 text-center text-sm text-muted-2">
          No sections yet — add one below.
        </p>
      )}
      {blocks.map((b, i) => (
        <BlockCard
          key={b.id}
          block={b}
          index={i}
          total={blocks.length}
          collections={collections}
          onPatch={patch}
          onMove={move}
          onRemove={remove}
        />
      ))}

      {/* add */}
      <div className="flex items-center gap-2 border-t border-line pt-5">
        <select
          aria-label="Section type to add"
          value={addType}
          onChange={(e) => setAddType(e.target.value as BlockType)}
          className="select w-auto py-2 text-xs"
        >
          {BLOCK_ORDER.map((t) => (
            <option key={t} value={t}>
              {BLOCK_META[t].label}
            </option>
          ))}
        </select>
        <button onClick={add} className="btn btn-outline btn-sm">
          + Add section
        </button>
      </div>
    </div>
  );
}

function BlockCard({
  block,
  index,
  total,
  collections,
  onPatch,
  onMove,
  onRemove,
}: {
  block: Block;
  index: number;
  total: number;
  collections: { name: string; slug: string }[];
  onPatch: (id: string, name: string, value: unknown) => void;
  onMove: (i: number, dir: -1 | 1) => void;
  onRemove: (id: string) => void;
}) {
  const meta = BLOCK_META[block.type];
  const rec = block as unknown as Record<string, unknown>;
  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="h-display text-lg">{meta.label}</p>
          <p className="text-xs text-muted-2">{meta.hint}</p>
        </div>
        <div className="flex gap-1 text-xs">
          <button
            onClick={() => onMove(index, -1)}
            disabled={index === 0}
            className="btn btn-sm btn-ghost px-2 py-1 disabled:opacity-30"
            aria-label="Move up"
          >
            ↑
          </button>
          <button
            onClick={() => onMove(index, 1)}
            disabled={index === total - 1}
            className="btn btn-sm btn-ghost px-2 py-1 disabled:opacity-30"
            aria-label="Move down"
          >
            ↓
          </button>
          <button
            onClick={() => onRemove(block.id)}
            className="btn btn-sm btn-ghost px-2 py-1 text-negative"
            aria-label="Remove section"
          >
            ✕
          </button>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {meta.fields.map((f) => (
          <FieldInput
            key={f.name}
            id={`blk-${block.id}-${f.name}`}
            field={f}
            value={rec[f.name]}
            collections={collections}
            onChange={(v) => onPatch(block.id, f.name, v)}
          />
        ))}
      </div>
    </div>
  );
}

function FieldInput({
  id,
  field,
  value,
  collections,
  onChange,
}: {
  id: string;
  field: Field;
  value: unknown;
  collections: { name: string; slug: string }[];
  onChange: (v: unknown) => void;
}) {
  const kind = field.kind;
  const wide = kind === "textarea" || kind === "images";

  if (kind === "images") {
    return (
      <div className="sm:col-span-2">
        <ImageUploader
          label={field.label}
          value={Array.isArray(value) ? (value as string[]) : []}
          onChange={(next) => onChange(next)}
          max={6}
        />
      </div>
    );
  }
  if (kind === "image") {
    return (
      <div>
        <ImageUploader
          label={field.label}
          value={value ? [String(value)] : []}
          onChange={(next) => onChange(next[0] ?? "")}
          max={1}
        />
      </div>
    );
  }

  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <label className="label" htmlFor={id}>{field.label}</label>
      {kind === "textarea" ? (
        <textarea
          id={id}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          className="textarea min-h-20"
        />
      ) : kind === "number" ? (
        <input
          id={id}
          type="number"
          value={Number(value ?? 0)}
          onChange={(e) => onChange(Number(e.target.value))}
          className="input"
        />
      ) : kind === "collection" ? (
        <select
          id={id}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          className="select"
        >
          <option value="">— pick a collection —</option>
          {collections.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      ) : typeof kind === "object" && "select" in kind ? (
        <select
          id={id}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          className="select"
        >
          {kind.select.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          className="input"
        />
      )}
    </div>
  );
}
