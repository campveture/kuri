"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { discountSchema } from "@/lib/validators";

type DiscountInput = {
  id?: string;
  code: string;
  type: "PERCENT" | "FIXED";
  value: number | string;
  minSubtotal: number | string;
  maxUses?: number | string;
  startsAt?: string;
  endsAt?: string;
  active: boolean;
};

export async function saveDiscount(input: DiscountInput) {
  await requireAdmin();
  const parsed = discountSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error: "Check the fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const d = parsed.data;
  const code = d.code.toUpperCase();

  if (d.type === "PERCENT" && d.value > 100) {
    return { error: "A percentage discount can't be over 100." };
  }

  const clash = await prisma.discount.findFirst({
    where: { code, ...(input.id ? { id: { not: input.id } } : {}) },
    select: { id: true },
  });
  if (clash) return { error: `The code ${code} is already in use.` };

  const data = {
    code,
    type: d.type,
    value: d.value,
    minSubtotal: d.minSubtotal,
    maxUses: d.maxUses ?? null,
    startsAt: d.startsAt ? new Date(d.startsAt) : null,
    endsAt: d.endsAt ? new Date(d.endsAt) : null,
    active: d.active,
  };

  if (input.id) {
    await prisma.discount.update({ where: { id: input.id }, data });
  } else {
    await prisma.discount.create({ data });
  }
  revalidatePath("/admin/discounts");
  return { ok: true };
}

export async function toggleDiscount(id: string, active: boolean) {
  await requireAdmin();
  await prisma.discount.update({ where: { id }, data: { active } });
  revalidatePath("/admin/discounts");
  return { ok: true };
}

export async function deleteDiscount(id: string) {
  await requireAdmin();
  const used = await prisma.order.count({ where: { discountId: id } });
  if (used > 0) {
    // keep order history intact — just deactivate
    await prisma.discount.update({ where: { id }, data: { active: false } });
    revalidatePath("/admin/discounts");
    return { ok: true, softDeleted: true };
  }
  await prisma.discount.delete({ where: { id } });
  revalidatePath("/admin/discounts");
  return { ok: true };
}
