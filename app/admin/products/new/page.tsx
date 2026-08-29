import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";

export const metadata = { title: "New tea" };

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { position: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="space-y-6">
      <Link href="/admin/products" className="text-xs uppercase tracking-[0.12em] text-muted-2 hover:text-gold-deep">
        ← Teas
      </Link>
      <h1 className="h-display text-3xl">New tea</h1>
      {categories.length === 0 ? (
        <p className="card p-5 text-sm text-muted">
          Add a <Link href="/admin/categories" className="text-gold-deep underline">category</Link> first.
        </p>
      ) : (
        <ProductForm categories={categories} />
      )}
    </div>
  );
}
