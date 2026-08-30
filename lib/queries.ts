import { prisma } from "@/lib/prisma";
import { parseImages, compareWeights } from "@/lib/utils";
import { parseBlocks } from "@/lib/blocks";
import type { Prisma } from "@prisma/client";

export type ProductCard = {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  subscribePrice: number | null;
  image: string | null;
  accent: string;
  accentDark: string;
  categoryName: string;
  categorySlug: string;
  tastingNotes: string[];
  inStock: boolean;
  featured: boolean;
  variants: { size: string; stock: number }[];
};

function toCard(
  p: Prisma.ProductGetPayload<{
    include: { category: true; variants: true };
  }>,
): ProductCard {
  const images = parseImages(p.images);
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    subscribePrice: p.subscribePrice,
    image: images[0] ?? null,
    accent: p.accent,
    accentDark: p.accentDark,
    categoryName: p.category.name,
    categorySlug: p.category.slug,
    tastingNotes: parseImages(p.tastingNotes),
    inStock: p.variants.some((v) => v.stock > 0),
    featured: p.featured,
    variants: [...p.variants]
      .sort((a, b) => compareWeights(a.size, b.size))
      .map((v) => ({ size: v.size, stock: v.stock })),
  };
}

export async function getCategories() {
  return prisma.category.findMany({
    orderBy: { position: "asc" },
    include: { _count: { select: { products: { where: { active: true } } } } },
  });
}

export async function getCollections() {
  return prisma.collection.findMany({
    where: { active: true },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    include: {
      _count: { select: { products: { where: { active: true } } } },
    },
  });
}

export async function getCollectionBySlug(slug: string) {
  const c = await prisma.collection.findFirst({
    where: { slug, active: true },
    include: {
      products: {
        where: { active: true },
        include: { category: true, variants: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!c) return null;
  return { ...c, cards: c.products.map(toCard) };
}

/** Products in a collection, as cards (for the homepage featured section). */
export async function getCollectionCards(
  slug: string,
  limit = 8,
): Promise<{ name: string; slug: string; cards: ProductCard[] } | null> {
  const c = await prisma.collection.findFirst({
    where: { slug, active: true },
    include: {
      products: {
        where: { active: true },
        include: { category: true, variants: true },
        orderBy: { createdAt: "desc" },
        take: limit,
      },
    },
  });
  if (!c) return null;
  return { name: c.name, slug: c.slug, cards: c.products.map(toCard) };
}

export async function getFeaturedProducts(limit = 8): Promise<ProductCard[]> {
  const rows = await prisma.product.findMany({
    where: { active: true, featured: true },
    include: { category: true, variants: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map(toCard);
}

export async function getNewArrivals(limit = 8): Promise<ProductCard[]> {
  const rows = await prisma.product.findMany({
    where: { active: true },
    include: { category: true, variants: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map(toCard);
}

export type ShopFilters = {
  category?: string;
  size?: string;
  /** Price band as "min-max" in taka, e.g. "400-550" or "700-" (open-ended). */
  price?: string;
  sort?: "new" | "price-asc" | "price-desc";
  q?: string;
};

/** "400-550" -> { gte: 400, lte: 550 }; "700-" -> { gte: 700 } */
export function parsePriceBand(
  band: string | undefined,
): { gte?: number; lte?: number } | null {
  if (!band) return null;
  const [minRaw, maxRaw] = band.split("-");
  const gte = Number(minRaw);
  const lte = Number(maxRaw);
  const range: { gte?: number; lte?: number } = {};
  if (Number.isFinite(gte) && gte > 0) range.gte = gte;
  if (maxRaw !== "" && maxRaw !== undefined && Number.isFinite(lte) && lte > 0)
    range.lte = lte;
  return range.gte === undefined && range.lte === undefined ? null : range;
}

export async function getShopProducts(filters: ShopFilters): Promise<ProductCard[]> {
  const where: Prisma.ProductWhereInput = { active: true };
  if (filters.category) where.category = { slug: filters.category };
  if (filters.size)
    where.variants = { some: { size: filters.size, stock: { gt: 0 } } };
  const priceRange = parsePriceBand(filters.price);
  if (priceRange) where.price = priceRange;
  if (filters.q) {
    const q = filters.q;
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { tags: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    filters.sort === "price-asc"
      ? { price: "asc" }
      : filters.sort === "price-desc"
        ? { price: "desc" }
        : { createdAt: "desc" };

  const rows = await prisma.product.findMany({
    where,
    include: { category: true, variants: true },
    orderBy,
  });
  return rows.map(toCard);
}

export async function getProductBySlug(slug: string) {
  const p = await prisma.product.findFirst({
    where: { slug, active: true },
    include: { category: true, variants: true },
  });
  if (!p) return null;
  return {
    ...p,
    variants: [...p.variants].sort((a, b) => compareWeights(a.size, b.size)),
    imageList: parseImages(p.images),
    tastingNoteList: parseImages(p.tastingNotes),
  };
}

/* ------------------------------- pages ------------------------------- */

/** The storefront home page record, if an admin has given it a block layout. */
export async function getHomePage() {
  const p = await prisma.page.findFirst({
    where: { isHome: true, status: "PUBLISHED" },
  });
  if (!p) return null;
  const blocks = parseBlocks(p.blocks);
  return blocks.length ? { ...p, parsedBlocks: blocks } : null;
}

/** A published, non-home landing page by slug. */
export async function getPageBySlug(slug: string) {
  const p = await prisma.page.findFirst({
    where: { slug, status: "PUBLISHED", isHome: false },
  });
  if (!p) return null;
  return { ...p, parsedBlocks: parseBlocks(p.blocks) };
}

export async function getRelatedProducts(
  categoryId: string,
  excludeId: string,
  limit = 4,
): Promise<ProductCard[]> {
  const rows = await prisma.product.findMany({
    where: { active: true, categoryId, id: { not: excludeId } },
    include: { category: true, variants: true },
    take: limit,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toCard);
}

/* ------------------------------ journal ------------------------------ */

export async function getPublishedPosts() {
  return prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });
}

export async function getPostBySlug(slug: string) {
  const post = await prisma.post.findFirst({
    where: { slug, status: "PUBLISHED" },
  });
  if (!post) return null;
  return { ...post, bodyList: parseImages(post.body) };
}
