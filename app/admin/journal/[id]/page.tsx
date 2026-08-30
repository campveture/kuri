import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseImages } from "@/lib/utils";
import { PostForm } from "@/components/admin/post-form";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Edit journal entry" };

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) notFound();

  const published = post.status === "PUBLISHED";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/journal"
          className="text-xs uppercase tracking-[0.12em] text-muted-2 hover:text-gold-deep"
        >
          ← Journal
        </Link>
        {published && (
          <Link
            href={`/journal/${post.slug}`}
            target="_blank"
            className="text-xs uppercase tracking-[0.12em] text-gold-deep"
          >
            View on site ↗
          </Link>
        )}
      </div>
      <h1 className="h-display text-3xl">{post.title}</h1>
      <PostForm
        initial={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          category: post.category,
          body: parseImages(post.body),
          coverImage: post.coverImage ?? "",
          status: post.status,
        }}
      />
    </div>
  );
}
