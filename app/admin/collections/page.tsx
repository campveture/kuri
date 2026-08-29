import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CollectionRowActions } from "@/components/admin/collection-row-actions";

export const metadata = { title: "Collections" };

export default async function AdminCollectionsPage() {
  const collections = await prisma.collection.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="h-display text-3xl">Collections</h1>
          <p className="mt-1 text-sm text-muted-2">
            Curated groups of teas, separate from categories. Show in the nav,
            get their own page, and can be featured on the homepage.
          </p>
        </div>
        <Link href="/admin/collections/new" className="btn btn-primary btn-sm">
          + New collection
        </Link>
      </div>

      {collections.length === 0 ? (
        <div className="card p-10 text-center text-sm text-muted-2">
          No collections yet.{" "}
          <Link href="/admin/collections/new" className="text-gold-deep">
            Create one →
          </Link>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream-2 text-xs uppercase tracking-[0.1em] text-muted-2">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Slug</th>
                <th className="p-3 text-left">Teas</th>
                <th className="p-3 text-left">State</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {collections.map((c) => (
                <tr key={c.id} className="border-t border-line">
                  <td className="p-3">
                    <Link
                      href={`/admin/collections/${c.id}`}
                      className="hover:text-gold-deep"
                    >
                      {c.name}
                    </Link>
                  </td>
                  <td className="p-3 text-muted-2">/{c.slug}</td>
                  <td className="p-3 text-muted-2">{c._count.products}</td>
                  <td className="p-3">
                    <span
                      className={
                        c.active
                          ? "badge border-[#3f5c43]/40 text-positive"
                          : "badge border-line text-muted-2"
                      }
                    >
                      {c.active ? "Visible" : "Hidden"}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <CollectionRowActions id={c.id} active={c.active} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
