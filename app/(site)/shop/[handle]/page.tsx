import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries";
import { PouchIllustration } from "@/components/PouchIllustration";
import { AddToCartForm } from "@/components/AddToCartForm";
import { ProductCard } from "@/components/ProductCard";

export async function generateMetadata(props: PageProps<"/shop/[handle]">): Promise<Metadata> {
  const { handle } = await props.params;
  const product = await getProductBySlug(handle);
  if (!product) return {};
  return {
    title: `${product.name} — Kuri`,
    description: product.description.slice(0, 160),
  };
}

export default async function ProductPage(props: PageProps<"/shop/[handle]">) {
  const { handle } = await props.params;
  const product = await getProductBySlug(handle);
  if (!product) notFound();

  const related = await getRelatedProducts(product.categoryId, product.id, 3);
  const spec = (v: string | null) => v || "—";

  return (
    <div>
      <div className="wrap pt-6 text-xs text-muted-2">
        <Link href="/">Home</Link>&nbsp;/&nbsp;<Link href="/shop">Shop</Link>&nbsp;/&nbsp;
        {product.name}
      </div>

      <div className="wrap flex flex-col gap-14 py-12 md:flex-row md:gap-24 md:py-24">
        <div className="flex aspect-[4/5] items-center justify-center rounded-sm bg-cream-2 md:flex-1">
          {product.imageList[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.imageList[0]} alt={product.name} className="h-full w-full rounded-sm object-cover" />
          ) : (
            <PouchIllustration
              color={product.accent}
              colorDark={product.accentDark}
              showLabel
              className="h-[90%] w-[52%]"
            />
          )}
        </div>

        <div className="md:flex-1 md:pt-2">
          <div className="eyebrow mb-4">{product.category.name}</div>
          <h1 className="font-serif text-3xl font-medium md:text-[38px]">{product.name}</h1>
          <div className="mt-5 mb-6 flex flex-wrap gap-2">
            {product.tastingNoteList.map((note) => (
              <span key={note} className="chip">{note}</span>
            ))}
          </div>
          <p className="mb-8 text-[15px] leading-relaxed text-charcoal-2">{product.description}</p>

          <AddToCartForm
            product={{
              id: product.id,
              handle: product.slug,
              name: product.name,
              price: product.price,
              subscribePrice: product.subscribePrice,
              accent: product.accent,
              variants: product.variants.map((v) => ({ size: v.size, stock: v.stock })),
            }}
          />
        </div>
      </div>

      <div className="bg-cream-2 py-16">
        <div className="wrap grid grid-cols-2 gap-10 md:grid-cols-4">
          <Spec label="Origin" value={spec(product.origin)} />
          <Spec label="Altitude" value={spec(product.altitude)} />
          <Spec label="Process" value={spec(product.process)} />
          <Spec label="Harvest" value={spec(product.harvest)} />
        </div>
      </div>

      {(product.brewTemp || product.brewDose || product.brewSteep || product.brewBestWith) && (
        <div className="wrap flex flex-col gap-10 py-20 md:flex-row md:gap-16 md:py-24">
          <div className="md:w-[240px] md:shrink-0">
            <div className="eyebrow mb-4">How to Brew</div>
            <h2 className="font-serif text-2xl font-medium md:text-[30px]">A proper cup</h2>
          </div>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm md:w-[280px] md:shrink-0">
            <Image src="/images/tea-cup.jpg" alt="A cup of freshly brewed tea" fill sizes="(min-width: 768px) 280px, 100vw" className="object-cover" />
          </div>
          <div className="grid max-w-[640px] grid-cols-2 gap-7">
            <Spec label="Water Temp" value={spec(product.brewTemp)} plain />
            <Spec label="Leaf Amount" value={spec(product.brewDose)} plain />
            <Spec label="Steep Time" value={spec(product.brewSteep)} plain />
            <Spec label="Best With" value={spec(product.brewBestWith)} plain />
          </div>
        </div>
      )}

      {related.length > 0 && (
        <div className="wrap pb-24 md:pb-28">
          <h2 className="mb-12 font-serif text-2xl font-medium md:text-[28px]">You may also like</h2>
          <div className="grid grid-cols-2 gap-10 md:grid-cols-3">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Spec({ label, value, plain }: { label: string; value: string; plain?: boolean }) {
  return (
    <div>
      <div className="spec-label">{label}</div>
      <div className={plain ? "text-[15px] leading-relaxed" : "font-serif text-[17px]"}>{value}</div>
    </div>
  );
}
