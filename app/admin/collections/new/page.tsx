import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { parseImages } from "@/lib/utils";
import { CollectionForm } from "@/components/admin/collection-form";

export const metadata = { title: "New collection" };

export default async function NewCollectionPage() {
  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
    include: { category: { select: { name: true } } },
  });

  return (
    <div className="space-y-6">
      <Link
        href="/admin/collections"
        className="text-xs uppercase tracking-[0.12em] text-muted-2 hover:text-gold-deep"
      >
        ← Collections
      </Link>
      <h1 className="h-display text-3xl">New collection</h1>
      <CollectionForm
        allProducts={products.map((p) => ({
          id: p.id,
          name: p.name,
          category: p.category.name,
          image: parseImages(p.images)[0] ?? "",
        }))}
      />
    </div>
  );
}
