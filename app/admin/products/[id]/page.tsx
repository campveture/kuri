import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseImages } from "@/lib/utils";
import { ProductForm } from "@/components/admin/product-form";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Edit tea" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { variants: { orderBy: { sku: "asc" } } },
    }),
    prisma.category.findMany({
      orderBy: { position: "asc" },
      select: { id: true, name: true },
    }),
  ]);
  if (!product) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/admin/products" className="text-xs uppercase tracking-[0.12em] text-muted-2 hover:text-gold-deep">
          ← Teas
        </Link>
        <Link href={`/shop/${product.slug}`} target="_blank" className="text-xs uppercase tracking-[0.12em] text-gold-deep">
          View on shop ↗
        </Link>
      </div>
      <h1 className="h-display text-3xl">{product.name}</h1>
      <ProductForm
        categories={categories}
        initial={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: String(product.price),
          compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : "",
          costPrice: product.costPrice ? String(product.costPrice) : "",
          subscribePrice: product.subscribePrice ? String(product.subscribePrice) : "",
          categoryId: product.categoryId,
          images: parseImages(product.images),
          tags: product.tags,
          featured: product.featured,
          active: product.active,
          tastingNotes: parseImages(product.tastingNotes).join(", "),
          origin: product.origin ?? "",
          altitude: product.altitude ?? "",
          process: product.process ?? "",
          harvest: product.harvest ?? "",
          brewTemp: product.brewTemp ?? "",
          brewDose: product.brewDose ?? "",
          brewSteep: product.brewSteep ?? "",
          brewBestWith: product.brewBestWith ?? "",
          accent: product.accent,
          accentDark: product.accentDark,
          variants: product.variants.map((v) => ({ size: v.size, stock: String(v.stock) })),
        }}
      />
    </div>
  );
}
