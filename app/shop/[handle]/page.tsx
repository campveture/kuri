import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllProducts, getProductByHandle, getRelatedProducts } from "@/lib/commerce";
import { PouchIllustration } from "@/components/PouchIllustration";
import { AddToCartForm } from "@/components/AddToCartForm";
import { ProductCard } from "@/components/ProductCard";

export function generateStaticParams() {
  return getAllProducts().map((product) => ({ handle: product.handle }));
}

export async function generateMetadata(props: PageProps<"/shop/[handle]">): Promise<Metadata> {
  const { handle } = await props.params;
  const product = getProductByHandle(handle);
  if (!product) return {};
  return {
    title: `${product.name} — Kuri`,
    description: product.shortDescription,
  };
}

export default async function ProductPage(props: PageProps<"/shop/[handle]">) {
  const { handle } = await props.params;
  const product = getProductByHandle(handle);
  if (!product) notFound();

  const related = getRelatedProducts(product.handle, 3);

  return (
    <div>
      <div className="wrap pt-6 text-xs text-muted-2">
        <Link href="/">Home</Link>&nbsp;/&nbsp;<Link href="/shop">Shop</Link>&nbsp;/&nbsp;
        {product.name}
      </div>

      {/* Product hero */}
      <div className="wrap flex flex-col gap-14 py-12 md:flex-row md:gap-24 md:py-24">
        <div className="flex aspect-[4/5] items-center justify-center rounded-sm bg-cream-2 md:flex-1">
          <PouchIllustration
            color={product.color}
            colorDark={product.colorDark}
            showLabel
            className="h-[90%] w-[52%]"
          />
        </div>

        <div className="md:flex-1 md:pt-2">
          <div className="eyebrow mb-4">{product.category}</div>
          <h1 className="font-serif text-3xl font-medium md:text-[38px]">{product.name}</h1>
          <div className="mt-5 mb-6 flex gap-2">
            {product.tastingNotes.map((note) => (
              <span key={note} className="chip">
                {note}
              </span>
            ))}
          </div>
          <p className="mb-8 text-[15px] leading-relaxed text-charcoal-2">{product.description}</p>

          <AddToCartForm product={product} />
        </div>
      </div>

      {/* Spec block */}
      <div className="bg-cream-2 py-16">
        <div className="wrap grid grid-cols-2 gap-10 md:grid-cols-4">
          <div>
            <div className="spec-label">Origin</div>
            <div className="font-serif text-[17px]">{product.origin}</div>
          </div>
          <div>
            <div className="spec-label">Altitude</div>
            <div className="font-serif text-[17px]">{product.altitude}</div>
          </div>
          <div>
            <div className="spec-label">Process</div>
            <div className="font-serif text-[17px]">{product.process}</div>
          </div>
          <div>
            <div className="spec-label">Harvest</div>
            <div className="font-serif text-[17px]">{product.harvest}</div>
          </div>
        </div>
      </div>

      {/* Brewing guide */}
      <div className="wrap flex flex-col gap-10 py-20 md:flex-row md:gap-16 md:py-24">
        <div className="md:w-[240px] md:shrink-0">
          <div className="eyebrow mb-4">How to Brew</div>
          <h2 className="font-serif text-2xl font-medium md:text-[30px]">A proper cup</h2>
        </div>
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm md:w-[280px] md:shrink-0">
          <Image
            src="/images/tea-cup.jpg"
            alt="A cup of freshly brewed black tea"
            fill
            sizes="(min-width: 768px) 280px, 100vw"
            className="object-cover"
          />
        </div>
        <div className="grid max-w-[640px] grid-cols-2 gap-7">
          <div>
            <div className="spec-label">Water Temp</div>
            <div className="text-[15px] leading-relaxed">{product.brew.temp}&deg;C, just off the boil</div>
          </div>
          <div>
            <div className="spec-label">Leaf Amount</div>
            <div className="text-[15px] leading-relaxed">{product.brew.dose}g per 200ml cup</div>
          </div>
          <div>
            <div className="spec-label">Steep Time</div>
            <div className="text-[15px] leading-relaxed">{product.brew.steepTime}</div>
          </div>
          <div>
            <div className="spec-label">Best With</div>
            <div className="text-[15px] leading-relaxed">{product.brew.bestWith}</div>
          </div>
        </div>
      </div>

      {/* Cross-sell */}
      <div className="wrap pb-24 md:pb-28">
        <h2 className="mb-12 font-serif text-2xl font-medium md:text-[28px]">You may also like</h2>
        <div className="grid grid-cols-2 gap-10 md:grid-cols-3">
          {related.map((p) => (
            <ProductCard key={p.handle} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
