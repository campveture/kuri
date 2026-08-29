"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { slugify, randomToken } from "@/lib/utils";
import { postSchema } from "@/lib/validators";

type PostInput = {
  id?: string;
  title: string;
  slug?: string;
  excerpt: string;
  category: string;
  body: string[];
  coverImage?: string;
  status: "DRAFT" | "PUBLISHED";
};

export async function savePost(input: PostInput) {
  await requireAdmin();

  const parsed = postSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error: "Check the journal fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const d = parsed.data;

  const baseSlug = slugify(d.slug ? d.slug : d.title);

  const clash = await prisma.post.findFirst({
    where: { slug: baseSlug, ...(input.id ? { id: { not: input.id } } : {}) },
    select: { id: true },
  });
  let slug = clash ? `${baseSlug}-${randomToken(4)}` : baseSlug;

  const existing = input.id
    ? await prisma.post.findUnique({
        where: { id: input.id },
        select: { publishedAt: true },
      })
    : null;

  const publishedAt =
    d.status === "PUBLISHED" && !existing?.publishedAt
      ? new Date()
      : existing?.publishedAt ?? null;

  const buildData = (slugToUse: string) => ({
    title: d.title,
    slug: slugToUse,
    excerpt: d.excerpt,
    category: d.category,
    body: JSON.stringify(d.body),
    coverImage: d.coverImage ? d.coverImage : null,
    status: d.status,
    publishedAt,
  });

  async function persist(slugToUse: string): Promise<string> {
    if (input.id) {
      const updated = await prisma.post.update({
        where: { id: input.id },
        data: buildData(slugToUse),
      });
      return updated.id;
    }
    const created = await prisma.post.create({ data: buildData(slugToUse) });
    return created.id;
  }

  let id: string;
  try {
    id = await persist(slug);
  } catch (e) {
    const err = e as { code?: string; meta?: { target?: unknown } };
    if (err?.code === "P2002" && String(err?.meta?.target ?? "").includes("slug")) {
      slug = `${baseSlug}-${randomToken(5)}`;
      id = await persist(slug);
    } else {
      return { error: "Could not save the journal entry. Try again." };
    }
  }

  revalidatePath("/journal");
  revalidatePath("/journal/" + slug);
  revalidatePath("/admin/journal");
  return { ok: true, id };
}

export async function deletePost(id: string) {
  await requireAdmin();
  const post = await prisma.post.findUnique({
    where: { id },
    select: { slug: true },
  });
  await prisma.post.delete({ where: { id } });
  revalidatePath("/journal");
  if (post) revalidatePath("/journal/" + post.slug);
  revalidatePath("/admin/journal");
  return { ok: true };
}

export async function togglePostPublished(id: string, published: boolean) {
  await requireAdmin();
  const post = await prisma.post.findUnique({
    where: { id },
    select: { publishedAt: true, slug: true },
  });
  if (!post) return { error: "Journal entry not found." };

  await prisma.post.update({
    where: { id },
    data: {
      status: published ? "PUBLISHED" : "DRAFT",
      publishedAt: published ? post.publishedAt ?? new Date() : post.publishedAt,
    },
  });

  revalidatePath("/journal");
  revalidatePath("/journal/" + post.slug);
  revalidatePath("/admin/journal");
  return { ok: true };
}
