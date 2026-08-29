import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCollectionBySlug } from "@/lib/queries";
import { ProductCard } from "@/components/ProductCard";

export async function generateMetadata(props: PageProps<"/collections/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const c = await getCollectionBySlug(slug);
  if (!c) return {};
  return { title: `${c.name} — Kuri`, description: c.description || undefined };
}

export default async function CollectionPage(props: PageProps<"/collections/[slug]">) {
  const { slug } = await props.params;
  const c = await getCollectionBySlug(slug);
  if (!c) notFound();

  return (
    <div className="wrap py-14 sm:py-20">
      <div className="mb-12 max-w-[560px]">
        <div className="eyebrow mb-3">Collection</div>
        <h1 className="font-serif text-[32px] font-medium sm:text-4xl md:text-[42px]">{c.name}</h1>
        {c.description && (
          <p className="mt-4 text-[15px] leading-relaxed text-charcoal-2">{c.description}</p>
        )}
      </div>
      {c.cards.length === 0 ? (
        <p className="text-[15px] text-muted-2">
          Nothing in this collection yet. <Link href="/shop" className="underline">Browse all tea →</Link>
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-4 md:gap-10">
          {c.cards.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
