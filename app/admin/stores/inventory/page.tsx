import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getInventoryMatrix } from "@/lib/erp";
import { InventoryMatrix } from "@/components/admin/inventory-matrix";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Inventory" };

export default async function InventoryPage() {
  await requireAdmin();
  const [{ stores, products }, online] = await Promise.all([
    getInventoryMatrix(),
    prisma.location.findFirst({ where: { kind: "ONLINE" } }),
  ]);

  const columns = [
    ...(online
      ? [{ id: online.id, name: online.name, kind: "ONLINE" as const }]
      : []),
    ...stores.map((s) => ({ id: s.id, name: s.name, kind: "STORE" as const })),
  ];

  const rows = products.flatMap((p) =>
    p.variants.map((v) => ({
      productId: p.id,
      productName: p.name,
      costPrice: p.costPrice,
      variantId: v.variantId,
      size: v.size,
      qty: {
        ...(online ? { [online.id]: v.online } : {}),
        ...v.byLocation,
      },
    })),
  );

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/stores" className="text-xs text-muted-2 hover:text-gold-deep">
          ← Stores
        </Link>
        <h1 className="h-display mt-1 text-3xl">Inventory</h1>
        <p className="mt-1 text-sm text-muted-2">
          Every weight, every location, one view. Adjust counts after a stock
          take or move stock between shops.
        </p>
      </div>
      {columns.length === 0 ? (
        <p className="text-sm text-muted-2">No locations yet.</p>
      ) : (
        <InventoryMatrix columns={columns} rows={rows} />
      )}
    </div>
  );
}
