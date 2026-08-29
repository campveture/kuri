"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PAGE_PATHS, isPageKey } from "@/lib/content";

type SaveResult = { ok: true } | { ok: false; error: string };

export async function savePageContent(
  page: string,
  data: unknown,
): Promise<SaveResult> {
  await requireAdmin();

  if (!isPageKey(page)) {
    return { ok: false, error: "Unknown page." };
  }

  try {
    const json = JSON.stringify(data ?? {});
    await prisma.pageContent.upsert({
      where: { page },
      create: { page, data: json },
      update: { data: json },
    });
  } catch {
    return { ok: false, error: "Could not save this page. Try again." };
  }

  revalidatePath(PAGE_PATHS[page]);
  return { ok: true };
}
