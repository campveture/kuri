import type { Metadata } from "next";
import Image from "next/image";
import { getAllProducts } from "@/lib/commerce";
import { ProductCard } from "@/components/ProductCard";

export const metadata: Metadata = {
  title: "Shop All Tea — Kuri",
  description: "Single-origin tea from Kuri Valley Estate, Sreemangal, Bangladesh.",
};

export default function ShopPage() {
  const products = getAllProducts();

  return (
    <div>
      <div className="relative h-[240px] overflow-hidden md:h-[300px]">
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
          <h1 className="font-serif text-3xl font-medium md:text-[38px]">All Tea</h1>
        </div>
      </div>

      <div className="wrap py-16 md:py-20">
        <p className="mb-14 max-w-[520px] text-[15px] leading-relaxed text-charcoal-2">
          Everything we make comes from one estate, one season at a time. No blending, no
          filler stock.
        </p>
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.handle} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
