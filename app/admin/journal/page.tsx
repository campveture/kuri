import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/admin/status-badge";
import { PostRowActions } from "@/components/admin/post-row-actions";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Journal" };

export default async function AdminJournalPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const PAGE_SIZE = 50;

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      orderBy: [{ createdAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.post.count(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="h-display text-3xl">Journal</h1>
        <Link href="/admin/journal/new" className="btn btn-primary btn-sm">
          + New post
        </Link>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-cream-2 text-xs uppercase tracking-[0.1em] text-muted-2">
            <tr>
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">State</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-muted-2">
                  No journal entries yet.
                </td>
              </tr>
            )}
            {posts.map((p) => (
              <tr key={p.id} className="border-t border-line">
                <td className="p-3">
                  <Link
                    href={`/admin/journal/${p.id}`}
                    className="font-medium hover:text-gold-deep"
                  >
                    {p.title}
                  </Link>
                </td>
                <td className="p-3 text-muted-2">{p.category}</td>
                <td className="p-3">
                  <StatusBadge status={p.status} />
                </td>
                <td className="p-3 text-muted-2">
                  {formatDate(p.publishedAt ?? p.createdAt)}
                </td>
                <td className="p-3 text-right">
                  <PostRowActions
                    id={p.id}
                    published={p.status === "PUBLISHED"}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <nav className="flex items-center justify-between text-xs text-muted-2">
          <span>
            Page {page} of {totalPages}
          </span>
          <span className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/admin/journal?page=${page - 1}`}
                className="btn btn-outline btn-sm"
              >
                Prev
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/journal?page=${page + 1}`}
                className="btn btn-outline btn-sm"
              >
                Next
              </Link>
            )}
          </span>
        </nav>
      )}
    </div>
  );
}
