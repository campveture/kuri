"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { savePageContent } from "@/app/admin/content/actions";
import { toast } from "@/components/ui/toaster";
import { ImageUploader } from "@/components/admin/image-uploader";
import { cn } from "@/lib/utils";
import {
  CONTENT_SCHEMA,
  getAtPath,
  newListItem,
  withPath,
  type Field,
  type PageKey,
} from "@/lib/content";

type State = Record<string, unknown>;

export function ContentForm({
  page,
  initial,
}: {
  page: PageKey;
  initial: unknown;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [state, setState] = useState<State>(
    () => structuredCloneSafe(initial) as State,
  );

  const schema = CONTENT_SCHEMA[page];

  const read = (path: string) => getAtPath(state, path);
  const write = (path: string, value: unknown) =>
    setState((s) => withPath(s, path, value));

  function moveItem(listPath: string, i: number, dir: -1 | 1) {
    setState((s) => {
      const arr = [...((getAtPath(s, listPath) as unknown[]) ?? [])];
      const j = i + dir;
      if (j < 0 || j >= arr.length) return s;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return withPath(s, listPath, arr);
    });
  }

  function addItem(listPath: string) {
    setState((s) => {
      const arr = [...((getAtPath(s, listPath) as unknown[]) ?? [])];
      arr.push(newListItem(page, listPath));
      return withPath(s, listPath, arr);
    });
  }

  function removeItem(listPath: string, i: number) {
    setState((s) => {
      const arr = [...((getAtPath(s, listPath) as unknown[]) ?? [])];
      arr.splice(i, 1);
      return withPath(s, listPath, arr);
    });
  }

  function submit() {
    start(async () => {
      const res = await savePageContent(page, state);
      if (res.ok) {
        toast("Saved", "success");
        router.refresh();
      } else {
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
      {schema.groups.map((group) => (
        <div key={group.label} className="card grid gap-4 p-5">
          <p className="label">{group.label}</p>
          {group.fields.map((field) => (
            <FieldInput
              key={field.path}
              id={`cf-${field.path}`}
              field={field}
              value={read(field.path)}
              onChange={(v) => write(field.path, v)}
            />
          ))}
        </div>
      ))}

      {schema.lists?.map((list) => {
        const items = (read(list.path) as unknown[]) ?? [];
        return (
          <div key={list.path} className="card grid gap-4 p-5">
            <p className="label">{list.label}</p>
            {items.length === 0 && (
              <p className="text-xs text-muted-2">No items.</p>
            )}
            {/* index key ok: rows are fully controlled from state, no internal state */}
            {items.map((_, i) => (
              <div key={i} className="border border-line p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-2">
                    {list.itemLabel} {i + 1}
                  </span>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      className="px-1.5 text-muted-2 hover:text-gold-deep disabled:opacity-30"
                      disabled={i === 0}
                      onClick={() => moveItem(list.path, i, -1)}
                      aria-label="Move up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="px-1.5 text-muted-2 hover:text-gold-deep disabled:opacity-30"
                      disabled={i === items.length - 1}
                      onClick={() => moveItem(list.path, i, 1)}
                      aria-label="Move down"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className="px-1.5 text-muted-2 hover:text-negative"
                      onClick={() => removeItem(list.path, i)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="grid gap-4">
                  {list.fields.map((field) => {
                    const itemPath = `${list.path}.${i}.${field.path}`;
                    return (
                      <FieldInput
                        key={itemPath}
                        id={`cf-${itemPath}`}
                        field={field}
                        value={read(itemPath)}
                        onChange={(v) => write(itemPath, v)}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-outline btn-sm w-fit"
              onClick={() => addItem(list.path)}
            >
              + Add {list.itemLabel.toLowerCase()}
            </button>
          </div>
        );
      })}

      <div className="flex gap-3">
        <button
          type="submit"
          className={cn("btn btn-primary", pending && "opacity-60")}
          disabled={pending}
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

function FieldInput({
  id,
  field,
  value,
  onChange,
}: {
  id: string;
  field: Field;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const str = typeof value === "string" ? value : value == null ? "" : String(value);

  if (field.kind === "image") {
    return (
      <div>
        <ImageUploader
          label={field.label}
          max={1}
          value={str ? [str] : []}
          onChange={(arr) => onChange(arr[0] ?? "")}
          hint={field.hint}
        />
      </div>
    );
  }

  return (
    <div>
      <label className="label" htmlFor={id}>{field.label}</label>
      {field.kind === "textarea" ? (
        <textarea
          id={id}
          className="textarea"
          value={str}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          id={id}
          className="input"
          value={str}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {field.hint && <p className="mt-1 text-[11px] text-muted-2">{field.hint}</p>}
    </div>
  );
}

function structuredCloneSafe<T>(value: T): T {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value)) as T;
}
