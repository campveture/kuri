"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { togglePostPublished, deletePost } from "@/app/admin/journal/actions";
import { toast } from "@/components/ui/toaster";

export function PostRowActions({
  id,
  published,
}: {
  id: string;
  published: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <div className="inline-flex items-center gap-3 text-xs">
      <Link
        href={`/admin/journal/${id}`}
        className="text-gold-deep hover:underline"
      >
        Edit
      </Link>
      <button
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await togglePostPublished(id, !published);
            if (res?.error) toast(res.error, "error");
            else {
              toast(published ? "Moved to draft" : "Published", "success");
              router.refresh();
            }
          })
        }
        className="text-muted-2 hover:text-charcoal disabled:opacity-40"
      >
        {published ? "Unpublish" : "Publish"}
      </button>
      <button
        disabled={pending}
        onClick={() => {
          if (!confirm("Delete this journal entry? This cannot be undone.")) return;
          start(async () => {
            const res = await deletePost(id);
            if (res?.error) toast(res.error, "error");
            else {
              toast("Journal entry deleted", "success");
              router.refresh();
            }
          });
        }}
        className="text-negative hover:underline disabled:opacity-40"
      >
        Delete
      </button>
    </div>
  );
}
