"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

const profileSchema = z.object({
  name: z.string().min(2, "Enter your name").max(80),
  phone: z
    .string()
    .min(11, "Enter a valid phone number")
    .max(20)
    .regex(/^[0-9+\-\s]+$/, "Digits only"),
});

const addressSchema = z.object({
  fullName: z.string().min(2, "Enter a name").max(80),
  phone: z
    .string()
    .min(11, "Enter a valid phone number")
    .max(20)
    .regex(/^[0-9+\-\s]+$/, "Digits only"),
  line1: z.string().min(6, "Enter your full address").max(240),
  area: z.string().min(2, "Enter your area / thana").max(80),
  city: z.string().min(2).max(60),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .max(100),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "New passwords don't match",
    path: ["confirmPassword"],
  });

export async function updateProfile(_prev: unknown, formData: FormData) {
  const user = await requireUser();
  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
  });
  if (!parsed.success) {
    return {
      error: "Check your name and phone number.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  await prisma.user.update({
    where: { id: user.id },
    data: parsed.data,
  });
  revalidatePath("/account");
  return { ok: true, message: "Profile updated." };
}

export async function saveAddress(_prev: unknown, formData: FormData) {
  const user = await requireUser();
  const parsed = addressSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    line1: formData.get("line1"),
    area: formData.get("area"),
    city: formData.get("city"),
  });
  if (!parsed.success) {
    return {
      error: "Check the address fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  await prisma.$transaction([
    prisma.address.updateMany({
      where: { userId: user.id },
      data: { isDefault: false },
    }),
    prisma.address.create({
      data: { ...parsed.data, userId: user.id, isDefault: true, label: "Home" },
    }),
  ]);
  revalidatePath("/account");
  return { ok: true, message: "Address saved." };
}

/** Change the signed-in user's own password (works for admin and customer). */
export async function changePassword(_prev: unknown, formData: FormData) {
  const user = await requireUser();
  const parsed = passwordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Check the form.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (
    !dbUser ||
    !(await bcrypt.compare(parsed.data.currentPassword, dbUser.passwordHash))
  ) {
    return { error: "Your current password is wrong." };
  }
  if (await bcrypt.compare(parsed.data.newPassword, dbUser.passwordHash)) {
    return { error: "The new password must be different from the old one." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(parsed.data.newPassword, 10) },
  });
  return { ok: true, message: "Password changed." };
}
