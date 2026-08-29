import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseImages } from "@/lib/utils";
import { CollectionForm } from "@/components/admin/collection-form";

export const metadata = { title: "Edit collection" };

export default async function EditCollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [collection, products] = await Promise.all([
    prisma.collection.findUnique({
      where: { id },
      include: { products: { select: { id: true } } },
    }),
    prisma.product.findMany({
      orderBy: { name: "asc" },
      include: { category: { select: { name: true } } },
    }),
  ]);
  if (!collection) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/admin/collections"
        className="text-xs uppercase tracking-[0.12em] text-muted-2 hover:text-gold-deep"
      >
        ← Collections
      </Link>
      <h1 className="h-display text-3xl">{collection.name}</h1>
      <CollectionForm
        allProducts={products.map((p) => ({
          id: p.id,
          name: p.name,
          category: p.category.name,
          image: parseImages(p.images)[0] ?? "",
        }))}
        initial={{
          id: collection.id,
          name: collection.name,
          slug: collection.slug,
          description: collection.description ?? "",
          image: collection.image ?? "",
          active: collection.active,
          productIds: collection.products.map((p) => p.id),
        }}
      />
    </div>
  );
}
