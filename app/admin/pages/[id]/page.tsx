import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCollections } from "@/lib/queries";
import { PageBuilder } from "@/components/admin/page-builder";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Edit page" };

export default async function EditAdminPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const [page, collections] = await Promise.all([
    prisma.page.findUnique({ where: { id } }),
    getCollections(),
  ]);
  if (!page) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/pages"
          className="text-xs uppercase tracking-[0.12em] text-muted-2 hover:text-gold-deep"
        >
          ← Pages
        </Link>
        <h1 className="h-display mt-1 text-3xl">
          {page.isHome ? "Homepage" : page.title}
        </h1>
        <p className="mt-1 text-sm text-muted-2">
          {page.isHome
            ? "Sections here replace the built-in homepage. Remove them all to fall back to the default layout."
            : "Arrange sections, then set the page to Published to make it live."}
        </p>
      </div>
      <PageBuilder
        page={{
          id: page.id,
          title: page.title,
          slug: page.slug,
          status: page.status,
          isHome: page.isHome,
          blocks: page.blocks,
          seoTitle: page.seoTitle,
          seoDescription: page.seoDescription,
        }}
        collections={collections.map((c) => ({ name: c.name, slug: c.slug }))}
      />
    </div>
  );
}
