"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function setContactHandled(id: string, handled: boolean) {
  await requireAdmin();
  await prisma.contactMessage.update({ where: { id }, data: { handled } });
  revalidatePath("/admin/messages");
  return { ok: true };
}

export async function deleteContactMessage(id: string) {
  await requireAdmin();
  await prisma.contactMessage.delete({ where: { id } });
  revalidatePath("/admin/messages");
  return { ok: true };
}

export async function toggleSubscriber(id: string, active: boolean) {
  await requireAdmin();
  await prisma.subscriber.update({ where: { id }, data: { active } });
  revalidatePath("/admin/messages");
  return { ok: true };
}

export async function deleteSubscriber(id: string) {
  await requireAdmin();
  await prisma.subscriber.delete({ where: { id } });
  revalidatePath("/admin/messages");
  return { ok: true };
}
