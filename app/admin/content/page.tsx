import Link from "next/link";
import { PAGE_KEYS, PAGE_LABELS, PAGE_PATHS } from "@/lib/content";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Page content" };

export default async function AdminContentPage() {
  await requireAdmin();
  return (
    <div className="space-y-6">
      <h1 className="h-display text-3xl">Page content</h1>
      <p className="max-w-2xl text-sm text-muted-2">
        Edit the text and images on the hand-built marketing pages. The layouts
        stay fixed — only the words and photos change.
      </p>

      <div className="space-y-3">
        {PAGE_KEYS.map((key) => (
          <div
            key={key}
            className="card flex items-center justify-between gap-4 p-4"
          >
            <div>
              <div className="font-medium">{PAGE_LABELS[key]}</div>
              <div className="text-xs text-muted-2">{PAGE_PATHS[key]}</div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <Link
                href={PAGE_PATHS[key]}
                target="_blank"
                className="text-xs uppercase tracking-[0.12em] text-muted-2 hover:text-gold-deep"
              >
                View page ↗
              </Link>
              <Link
                href={`/admin/content/${key}`}
                className="btn btn-outline btn-sm"
              >
                Edit
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
