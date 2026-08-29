"use client";

import { useEffect, useState, useTransition } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { saveCategory, deleteCategory } from "@/app/admin/actions";
import { toast } from "@/components/ui/toaster";
import { ImageUploader } from "@/components/admin/image-uploader";

type Cat = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  count: number;
};

type SaveState = { ok?: boolean; error?: string } | null;

export function CategoryManager({ categories }: { categories: Cat[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Cat | null>(null);
  const [pending, start] = useTransition();
  const [state, action] = useActionState<SaveState, FormData>(saveCategory, null);

  useEffect(() => {
    if (state?.ok) {
      toast("Category saved", "success");
      setEditing(null);
      router.refresh();
    }
  }, [state, router]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-cream-2 text-xs uppercase tracking-[0.1em] text-muted-2">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Slug</th>
              <th className="p-3 text-left">Image</th>
              <th className="p-3 text-left">Teas</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-t border-line">
                <td className="p-3">{c.name}</td>
                <td className="p-3 text-muted-2">{c.slug}</td>
                <td className="p-3">
                  {c.image ? (
                    <span className="inline-flex h-8 w-8 overflow-hidden border border-line">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={c.image} alt="" className="h-full w-full object-cover" />
                    </span>
                  ) : (
                    <span className="text-xs text-muted-2">—</span>
                  )}
                </td>
                <td className="p-3 text-muted-2">{c.count}</td>
                <td className="p-3 text-right text-xs">
                  <button className="mr-3 text-gold-deep hover:underline" onClick={() => setEditing(c)}>
                    Edit
                  </button>
                  <button
                    className="text-negative hover:underline disabled:opacity-40"
                    disabled={pending}
                    onClick={() =>
                      start(async () => {
                        const res = await deleteCategory(c.id);
                        if (res.error) toast(res.error, "error");
                        else {
                          toast("Category deleted", "success");
                          router.refresh();
                        }
                      })
                    }
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-muted-2">No categories yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <CategoryForm
        key={editing?.id ?? "new"}
        editing={editing}
        action={action}
        error={state?.error}
        onNew={() => setEditing(null)}
      />
    </div>
  );
}

function CategoryForm({
  editing,
  action,
  error,
  onNew,
}: {
  editing: Cat | null;
  action: (formData: FormData) => void;
  error?: string;
  onNew: () => void;
}) {
  const [image, setImage] = useState<string[]>(editing?.image ? [editing.image] : []);

  return (
    <form action={action} className="card h-max p-5">
      <h2 className="h-display text-lg">{editing ? "Edit category" : "Add category"}</h2>
      {editing && <input type="hidden" name="id" value={editing.id} />}

      <label className="label mt-3">Name</label>
      <input name="name" defaultValue={editing?.name} className="input" required />

      <label className="label mt-3">Slug (optional)</label>
      <input name="slug" defaultValue={editing?.slug} className="input" placeholder="auto from name" />

      <label className="label mt-3">Description</label>
      <textarea name="description" defaultValue={editing?.description ?? ""} className="textarea" />

      <div className="mt-4">
        <ImageUploader
          label="Card background image"
          value={image}
          onChange={setImage}
          max={1}
          hint="Shown behind this category on the homepage. Leave empty for the plain card."
        />
        <input type="hidden" name="image" value={image[0] ?? ""} />
      </div>

      {error && <p className="mt-2 text-xs text-negative">{error}</p>}

      <div className="mt-4 flex gap-2">
        <button className="btn btn-primary btn-sm flex-1">{editing ? "Save" : "Add"}</button>
        {editing && (
          <button type="button" className="btn btn-outline btn-sm" onClick={onNew}>
            New
          </button>
        )}
      </div>
    </form>
  );
}
