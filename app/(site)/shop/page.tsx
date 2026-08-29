import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getShopProducts, type ShopFilters } from "@/lib/queries";
import { getCategories } from "@/lib/queries";
import { PRICE_BANDS } from "@/lib/site";
import { ProductCard } from "@/components/ProductCard";

export const metadata: Metadata = {
  title: "Shop All Tea — Kuri",
  description: "Single-origin tea from Kuri Valley Estate, Sreemangal, Bangladesh.",
};

const SORTS = [
  { key: "new", label: "Newest" },
  { key: "price-asc", label: "Price ↑" },
  { key: "price-desc", label: "Price ↓" },
];

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const filters: ShopFilters = {
    category: sp.category,
    price: sp.price,
    sort: (sp.sort as ShopFilters["sort"]) ?? "new",
    q: sp.q,
  };
  const [products, categories] = await Promise.all([
    getShopProducts(filters),
    getCategories(),
  ]);

  const qs = (patch: Record<string, string | undefined>) => {
    const merged = { ...sp, ...patch };
    const entries = Object.entries(merged).filter(([, v]) => v);
    return "?" + new URLSearchParams(entries as [string, string][]).toString();
  };

  return (
    <div>
      <div className="relative h-[200px] overflow-hidden sm:h-[240px] md:h-[300px]">
        <Image
          src="/images/hero-2.jpg"
          alt="Close-up of a tea bush at a Sreemangal tea garden, Bangladesh"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[rgba(43,36,28,0.45)]" />
        <div className="wrap relative flex h-full flex-col justify-end pb-10 text-cream">
          <div className="eyebrow mb-2 text-gold">The Collection</div>
          <h1 className="font-serif text-[28px] font-medium sm:text-3xl md:text-[38px]">All Tea</h1>
        </div>
      </div>

      <div className="wrap py-12 sm:py-16 md:py-20">
        <div className="mb-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
          <Link href="/shop" className={!filters.category ? "font-semibold" : "text-muted-2"}>
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={qs({ category: c.slug })}
              className={filters.category === c.slug ? "font-semibold" : "text-muted-2"}
            >
              {c.name}
            </Link>
          ))}
          <span className="ml-auto flex gap-4">
            {SORTS.map((s) => (
              <Link
                key={s.key}
                href={qs({ sort: s.key })}
                className={filters.sort === s.key ? "font-semibold" : "text-muted-2"}
              >
                {s.label}
              </Link>
            ))}
          </span>
        </div>

        <div className="mb-12 flex flex-wrap gap-2 text-xs">
          {PRICE_BANDS.map((b) => (
            <Link
              key={b.key}
              href={qs({ price: filters.price === b.key ? undefined : b.key })}
              className={`chip ${filters.price === b.key ? "border-charcoal text-charcoal" : ""}`}
            >
              {b.label}
            </Link>
          ))}
        </div>

        {products.length === 0 ? (
          <p className="text-[15px] text-muted-2">No teas match that filter.</p>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-4 md:gap-10">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
