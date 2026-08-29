"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import {
  parseBlocks,
  serializeBlocks,
  RESERVED_SLUGS,
  type Block,
} from "@/lib/blocks";
import { templateByKey } from "@/lib/page-templates";

type Result = { ok: true; id?: string } | { ok: false; error: string };

export async function createPage(input: {
  title: string;
  slug: string;
  templateKey: string;
}): Promise<Result> {
  await requireAdmin();
  const title = input.title.trim();
  if (!title) return { ok: false, error: "Give the page a title." };
  const slug = slugify(input.slug || input.title);
  if (!slug) return { ok: false, error: "That slug is not usable." };
  if (RESERVED_SLUGS.has(slug))
    return {
      ok: false,
      error: `"/${slug}" is reserved by the store. Pick another slug.`,
    };
  const clash = await prisma.page.findUnique({ where: { slug } });
  if (clash) return { ok: false, error: `A page with slug "/${slug}" already exists.` };

  const blocks = templateByKey(input.templateKey).blocks();
  const page = await prisma.page.create({
    data: {
      title,
      slug,
      status: "DRAFT",
      isHome: false,
      blocks: serializeBlocks(blocks),
    },
  });
  redirect(`/admin/pages/${page.id}`);
}

export async function savePage(
  id: string,
  input: {
    title: string;
    slug: string;
    status: "DRAFT" | "PUBLISHED";
    blocks: Block[];
    seoTitle: string;
    seoDescription: string;
  },
): Promise<Result> {
  await requireAdmin();
  const page = await prisma.page.findUnique({ where: { id } });
  if (!page) return { ok: false, error: "Page not found." };

  const title = input.title.trim() || page.title;
  const blocks = parseBlocks(serializeBlocks(input.blocks)); // normalise
  const data: Record<string, unknown> = {
    title,
    blocks: serializeBlocks(blocks),
    seoTitle: input.seoTitle.trim() || null,
    seoDescription: input.seoDescription.trim() || null,
  };

  const prevSlug = page.slug;
  if (!page.isHome) {
    const slug = slugify(input.slug || title);
    if (!slug) return { ok: false, error: "That slug is not usable." };
    if (RESERVED_SLUGS.has(slug))
      return { ok: false, error: `"/${slug}" is reserved by the store.` };
    if (slug !== page.slug) {
      const clash = await prisma.page.findUnique({ where: { slug } });
      if (clash) return { ok: false, error: `Slug "/${slug}" is taken.` };
    }
    data.slug = slug;
    data.status = input.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
  }

  await prisma.page.update({ where: { id }, data });

  revalidatePath("/admin/pages");
  revalidatePath("/admin/pages/" + id);
  if (page.isHome) revalidatePath("/");
  else {
    revalidatePath("/" + prevSlug);
    if (data.slug) revalidatePath("/" + (data.slug as string));
  }
  return { ok: true, id };
}

export async function deletePage(id: string): Promise<Result> {
  await requireAdmin();
  const page = await prisma.page.findUnique({ where: { id } });
  if (!page) return { ok: false, error: "Page not found." };
  if (page.isHome)
    return {
      ok: false,
      error: "The home page can't be deleted — clear its sections instead.",
    };
  await prisma.page.delete({ where: { id } });
  revalidatePath("/admin/pages");
  revalidatePath("/" + page.slug);
  return { ok: true };
}
