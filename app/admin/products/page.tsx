import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatBDT, parseImages } from "@/lib/utils";
import { ProductRowActions } from "@/components/admin/product-row-actions";

export const metadata = { title: "Teas" };

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const products = await prisma.product.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { tags: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: { category: true, variants: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="h-display text-3xl">Teas</h1>
        <Link href="/admin/products/new" className="btn btn-primary btn-sm">
          + New tea
        </Link>
      </div>

      <form method="get" className="flex max-w-md gap-2">
        <input name="q" defaultValue={q} placeholder="Search teas" className="input py-2 text-sm" />
        <button className="btn btn-outline btn-sm">Search</button>
      </form>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-cream-2 text-xs uppercase tracking-[0.1em] text-muted-2">
            <tr>
              <th className="p-3 text-left">Tea</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-left">Stock</th>
              <th className="p-3 text-left">State</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-muted-2">No teas yet.</td>
              </tr>
            )}
            {products.map((p) => {
              const stock = p.variants.reduce((n, v) => n + v.stock, 0);
              const img = parseImages(p.images)[0];
              return (
                <tr key={p.id} className="border-t border-line">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-11 w-11 shrink-0 overflow-hidden rounded border border-line"
                        style={{ background: p.accent }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {img ? <img src={img} alt="" className="h-full w-full object-cover" /> : null}
                      </div>
                      <div>
                        <Link href={`/admin/products/${p.id}`} className="font-medium hover:text-gold-deep">
                          {p.name}
                        </Link>
                        {p.featured && <span className="ml-2 text-xs text-gold-deep">★ featured</span>}
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-muted-2">{p.category.name}</td>
                  <td className="p-3">
                    {formatBDT(p.price)}
                    {p.compareAtPrice ? (
                      <span className="ml-1 text-xs text-muted-2 line-through">
                        {formatBDT(p.compareAtPrice)}
                      </span>
                    ) : null}
                  </td>
                  <td className={"p-3 " + (stock === 0 ? "text-negative" : "text-muted-2")}>{stock}</td>
                  <td className="p-3">
                    <span className="badge" style={p.active ? { background: "#e6efe7", color: "#2c4030", borderColor: "#c2d8c6" } : undefined}>
                      {p.active ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <ProductRowActions id={p.id} active={p.active} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
