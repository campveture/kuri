import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { parseImages } from "@/lib/utils";
import { ManualOrderForm } from "@/components/admin/manual-order-form";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "New order" };

export default async function NewOrderPage() {
  await requireAdmin();
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    include: { variants: { orderBy: { size: "asc" } } },
  });

  return (
    <div className="space-y-6">
      <Link
        href="/admin/orders"
        className="text-xs uppercase tracking-[0.12em] text-muted-2 hover:text-gold-deep"
      >
        ← Orders
      </Link>
      <div>
        <h1 className="h-display text-3xl">New order</h1>
        <p className="mt-1 text-sm text-muted-2">
          For phone / walk-in / DM orders. Decrements stock like a storefront
          order.
        </p>
      </div>
      <ManualOrderForm
        products={products.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image: parseImages(p.images)[0] ?? "",
          variants: p.variants.map((v) => ({ size: v.size, stock: v.stock })),
        }))}
      />
    </div>
  );
}
