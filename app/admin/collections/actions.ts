"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { slugify, randomToken } from "@/lib/utils";
import { collectionSchema } from "@/lib/validators";

type CollectionInput = {
  id?: string;
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  active: boolean;
  productIds: string[];
};

export async function saveCollection(input: CollectionInput) {
  await requireAdmin();
  const parsed = collectionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error: "Check the fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const d = parsed.data;
  const base = d.slug ? slugify(d.slug) : slugify(d.name);
  const clash = await prisma.collection.findFirst({
    where: { slug: base, ...(input.id ? { id: { not: input.id } } : {}) },
    select: { id: true },
  });
  const slug = clash ? `${base}-${randomToken(4)}` : base;
  const prevSlug = input.id
    ? (await prisma.collection.findUnique({ where: { id: input.id }, select: { slug: true } }))?.slug
    : null;

  const base_ = {
    name: d.name,
    slug,
    description: d.description || null,
    image: d.image || null,
    active: d.active,
  };
  const connectProducts = d.productIds.map((id) => ({ id }));

  if (input.id) {
    await prisma.collection.update({
      where: { id: input.id },
      data: { ...base_, products: { set: connectProducts } },
    });
  } else {
    const count = await prisma.collection.count();
    await prisma.collection.create({
      data: {
        ...base_,
        position: count,
        products: { connect: connectProducts },
      },
    });
  }
  revalidatePath("/admin/collections");
  revalidatePath("/", "layout");
  revalidatePath("/shop");
  revalidatePath("/collections/" + slug);
  if (prevSlug && prevSlug !== slug) revalidatePath("/collections/" + prevSlug);
  return { ok: true };
}

export async function toggleCollection(id: string, active: boolean) {
  await requireAdmin();
  await prisma.collection.update({ where: { id }, data: { active } });
  revalidatePath("/admin/collections");
  revalidatePath("/", "layout");
  revalidatePath("/collections", "layout");
  return { ok: true };
}

export async function deleteCollection(id: string) {
  await requireAdmin();
  await prisma.collection.delete({ where: { id } });
  revalidatePath("/admin/collections");
  revalidatePath("/", "layout");
  revalidatePath("/collections", "layout");
  return { ok: true };
}
