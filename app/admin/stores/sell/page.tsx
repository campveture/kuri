import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { parseImages } from "@/lib/utils";
import { PosForm } from "@/components/admin/pos-form";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Record a sale" };

export default async function SellPage() {
  await requireAdmin();
  const [locations, products, levels] = await Promise.all([
    prisma.location.findMany({
      where: { active: true },
      orderBy: [{ kind: "asc" }, { position: "asc" }, { createdAt: "asc" }],
    }),
    prisma.product.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      include: { variants: { orderBy: { size: "asc" } } },
    }),
    prisma.inventoryLevel.findMany(),
  ]);

  const online = locations.find((l) => l.kind === "ONLINE");
  const levelMap = new Map(
    levels.map((l) => [`${l.locationId}:${l.variantId}`, l.quantity]),
  );

  const payload = products.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    image: parseImages(p.images)[0] ?? null,
    accent: p.accent,
    variants: p.variants.map((v) => {
      const stockByLoc: Record<string, number> = {};
      for (const l of locations) {
        stockByLoc[l.id] =
          online && l.id === online.id
            ? v.stock
            : levelMap.get(`${l.id}:${v.id}`) ?? 0;
      }
      return { variantId: v.id, size: v.size, stockByLoc };
    }),
  }));

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/stores" className="text-xs text-muted-2 hover:text-gold-deep">
          ← Stores
        </Link>
        <h1 className="h-display mt-1 text-3xl">Record a sale</h1>
        <p className="mt-1 text-sm text-muted-2">
          Counter / walk-in sales. Stock at the chosen store drops immediately
          and the sale flows into your profit reports.
        </p>
      </div>
      <PosForm
        locations={locations.map((l) => ({ id: l.id, name: l.name, kind: l.kind }))}
        products={payload}
      />
    </div>
  );
}
