import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseImages } from "@/lib/utils";

/** Lightweight catalogue for the client-side search overlay. */
export async function GET() {
  const rows = await prisma.product.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    include: { category: { select: { name: true } }, variants: { select: { stock: true } } },
  });
  return NextResponse.json(
    rows.map((p) => ({
      slug: p.slug,
      name: p.name,
      category: p.category.name,
      tastingNotes: parseImages(p.tastingNotes),
      price: p.price,
      inStock: p.variants.some((v) => v.stock > 0),
    })),
  );
}
