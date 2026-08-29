import Link from "next/link";
import type {
  Block,
  HeroBlock,
  MarqueeBlock,
  ProductGridBlock,
  CollectionsBlock,
  BannerBlock,
  StoryBlock,
  RichTextBlock,
} from "@/lib/blocks";
import { ProductCard } from "@/components/ProductCard";
import { PouchIllustration } from "@/components/PouchIllustration";
import {
  getFeaturedProducts,
  getNewArrivals,
  getCollectionCards,
  getCollections,
  type ProductCard as Card,
} from "@/lib/queries";

export async function BlockRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <div>
      {blocks.map((b) => (
        <BlockView key={b.id} block={b} />
      ))}
    </div>
  );
}

async function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "hero":
      return <HeroView b={block} />;
    case "marquee":
      return <MarqueeView b={block} />;
    case "productGrid":
      return <ProductGridView b={block} />;
    case "collections":
      return <CollectionsView b={block} />;
    case "banner":
      return <BannerView b={block} />;
    case "story":
      return <StoryView b={block} />;
    case "richText":
      return <RichTextView b={block} />;
    default:
      return null;
  }
}

/* ------------------------------- hero -------------------------------- */

function HeroView({ b }: { b: HeroBlock }) {
  const lines = (b.headline || "").split("\n");
  const centered = b.align === "center";
  return (
    <section className="relative overflow-hidden border-b border-line bg-cream">
      <div
        className={`wrap relative gap-10 py-20 lg:py-28 ${
          centered ? "flex flex-col items-center text-center" : "grid lg:grid-cols-[1.1fr_0.9fr]"
        }`}
      >
        <div className="flex flex-col justify-center">
          {b.eyebrow && <p className="eyebrow">{b.eyebrow}</p>}
          <h1 className="mt-4 font-serif text-4xl font-medium leading-[1.05] sm:text-5xl lg:text-6xl">
            {lines.map((line, i) => (
              <span key={i} className="block">
                {i === lines.length - 1 && lines.length > 1 ? (
                  <span className="text-gold-deep">{line}</span>
                ) : (
                  line
                )}
              </span>
            ))}
          </h1>
          {b.subtext && (
            <p
              className={`mt-6 max-w-md whitespace-pre-line text-[15px] leading-relaxed text-charcoal-2 ${
                centered ? "mx-auto" : ""
              }`}
            >
              {b.subtext}
            </p>
          )}
          <div className={`mt-8 flex flex-wrap gap-3 ${centered ? "justify-center" : ""}`}>
            {b.primaryLabel && (
              <Link href={b.primaryHref || "/shop"} className="btn btn-primary">
                {b.primaryLabel}
              </Link>
            )}
            {b.secondaryLabel && (
              <Link href={b.secondaryHref || "/shop"} className="btn btn-outline">
                {b.secondaryLabel}
              </Link>
            )}
          </div>
        </div>

        {!centered && (
          <div className="relative flex items-center justify-center">
            {b.images.length > 0 ? (
              <div
                className={
                  b.images.length === 1
                    ? "w-full max-w-sm"
                    : "grid w-full max-w-md grid-cols-2 gap-3"
                }
              >
                {b.images.slice(0, 4).map((src, i) => (
                  <div
                    key={src + i}
                    className={`relative overflow-hidden rounded-sm border border-line bg-cream-2 ${
                      b.images.length === 3 && i === 0 ? "col-span-2 aspect-[16/10]" : "aspect-[4/5]"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="relative flex aspect-square w-full max-w-sm items-center justify-center rounded-sm border border-line bg-cream-2">
                <PouchIllustration color="#c89a3e" colorDark="#a97f2e" className="h-40 w-28" />
              </div>
            )}
          </div>
        )}

        {centered && b.images.length > 0 && (
          <div className="mt-4 grid w-full max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
            {b.images.slice(0, 4).map((src, i) => (
              <div
                key={src + i}
                className="relative aspect-[4/5] overflow-hidden rounded-sm border border-line bg-cream-2"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ------------------------------ marquee ------------------------------ */

function MarqueeView({ b }: { b: MarqueeBlock }) {
  if (!b.text?.trim()) return null;
  const text = b.text.trim();
  return (
    <div className="marquee overflow-hidden border-y border-line bg-gold py-2.5">
      <div className="marquee-track text-xs font-semibold uppercase tracking-[0.2em] text-charcoal">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i}>{text} ✦</span>
        ))}
      </div>
      <div className="marquee-track text-xs font-semibold uppercase tracking-[0.2em] text-charcoal" aria-hidden="true">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i}>{text} ✦</span>
        ))}
      </div>
    </div>
  );
}

/* --------------------------- product grid --------------------------- */

async function ProductGridView({ b }: { b: ProductGridBlock }) {
  const limit = Math.min(Math.max(Number(b.limit) || 8, 2), 24);
  let cards: Card[] = [];
  if (b.source === "featured") cards = await getFeaturedProducts(limit);
  else if (b.source === "new") cards = await getNewArrivals(limit);
  else if (b.source === "collection" && b.collectionSlug) {
    const c = await getCollectionCards(b.collectionSlug, limit);
    cards = c?.cards ?? [];
  }
  if (cards.length === 0) return null;
  return (
    <section className="wrap py-16">
      {b.heading && <h2 className="font-serif text-3xl font-medium sm:text-4xl">{b.heading}</h2>}
      {b.subheading && <p className="mt-2 text-sm text-muted-2">{b.subheading}</p>}
      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
        {cards.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

/* --------------------------- collections --------------------------- */

async function CollectionsView({ b }: { b: CollectionsBlock }) {
  const collections = await getCollections();
  if (collections.length === 0) return null;
  return (
    <section className="wrap py-16">
      {b.heading && <h2 className="font-serif text-3xl font-medium sm:text-4xl">{b.heading}</h2>}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((c) => (
          <Link
            key={c.id}
            href={`/collections/${c.slug}`}
            className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-sm border border-line bg-cream-2 p-6"
          >
            {c.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={c.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70 transition group-hover:opacity-90" />
            )}
            <div className="relative">
              <div className="font-serif text-xl font-medium">{c.name}</div>
              <div className="mt-1 text-xs text-muted-2">{c._count.products} teas →</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------ banner ----------------------------- */

function BannerView({ b }: { b: BannerBlock }) {
  const gold = b.tone === "gold";
  return (
    <section
      className={`relative overflow-hidden border-y border-line ${
        gold ? "bg-gold text-charcoal" : "bg-charcoal text-cream"
      }`}
    >
      {b.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={b.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
      )}
      <div className="wrap relative flex flex-col items-center gap-4 py-14 text-center">
        {b.heading && <p className="font-serif text-3xl font-medium sm:text-4xl">{b.heading}</p>}
        {b.body && <p className="max-w-lg text-sm font-medium">{b.body}</p>}
        {b.ctaLabel && (
          <Link
            href={b.ctaHref || "/shop"}
            className={gold ? "btn btn-primary mt-2" : "btn btn-on-dark mt-2"}
          >
            {b.ctaLabel}
          </Link>
        )}
      </div>
    </section>
  );
}

/* ------------------------------ story ----------------------------- */

function StoryView({ b }: { b: StoryBlock }) {
  const right = b.imageSide === "right";
  return (
    <section className="wrap py-16">
      <div className="grid items-center gap-8 lg:grid-cols-2">
        <div className={right ? "lg:order-1" : "lg:order-2"}>
          {b.image ? (
            <div className="relative aspect-[4/3] overflow-hidden rounded-sm border border-line bg-cream-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={b.image} alt="" className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center rounded-sm border border-line bg-cream-2">
              <PouchIllustration color="#c89a3e" colorDark="#a97f2e" className="h-28 w-20" />
            </div>
          )}
        </div>
        <div className={right ? "lg:order-2" : "lg:order-1"}>
          {b.heading && <h2 className="font-serif text-3xl font-medium sm:text-4xl">{b.heading}</h2>}
          {b.body && (
            <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-charcoal-2">{b.body}</p>
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------- rich text --------------------------- */

function RichTextView({ b }: { b: RichTextBlock }) {
  if (!b.heading?.trim() && !b.body?.trim()) return null;
  return (
    <section className="wrap py-16">
      <div className={`mx-auto max-w-2xl ${b.align === "center" ? "text-center" : ""}`}>
        {b.heading && <h2 className="font-serif text-3xl font-medium sm:text-4xl">{b.heading}</h2>}
        {b.body && (
          <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-charcoal-2">{b.body}</p>
        )}
      </div>
    </section>
  );
}
