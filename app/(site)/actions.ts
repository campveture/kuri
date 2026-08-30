"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { newsletterSchema, contactSchema } from "@/lib/validators";

export type FormResult = { ok?: boolean; error?: string; message?: string };

const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_WINDOW = 6;

async function ipKey(prefix: string): Promise<string> {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown";
  return `${prefix}:${ip}`;
}

/** Light IP throttle shared by the public forms — reuses the LoginAttempt table. */
async function throttled(key: string): Promise<boolean> {
  const since = new Date(Date.now() - WINDOW_MS);
  const recent = await prisma.loginAttempt.count({
    where: { key, createdAt: { gte: since } },
  });
  await prisma.loginAttempt.create({ data: { key, success: true } });
  return recent >= MAX_PER_WINDOW;
}

export async function subscribeEmail(
  _prev: FormResult,
  formData: FormData,
): Promise<FormResult> {
  const parsed = newsletterSchema.safeParse({
    email: formData.get("email"),
    source: formData.get("source") || "newsletter",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Enter a valid email" };
  }

  if (await throttled(await ipKey("nl"))) {
    return { error: "Too many attempts. Try again in a bit." };
  }

  const { email, source } = parsed.data;
  try {
    await prisma.subscriber.upsert({
      where: { email },
      create: { email, source: source ?? "newsletter" },
      update: { active: true },
    });
  } catch {
    return { error: "Could not sign you up. Try again." };
  }
  revalidatePath("/admin/messages");
  return { ok: true, message: "You're on the list — we'll email when tea lands." };
}

export async function submitContact(
  _prev: FormResult,
  formData: FormData,
): Promise<FormResult> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    topic: formData.get("topic") || "General",
    message: formData.get("message"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form." };
  }

  if (await throttled(await ipKey("contact"))) {
    return { error: "Too many messages. Try again in a bit." };
  }

  const d = parsed.data;
  try {
    await prisma.contactMessage.create({
      data: {
        name: d.name,
        email: d.email,
        topic: d.topic ?? "General",
        message: d.message,
      },
    });
  } catch {
    return { error: "Could not send your message. Try again." };
  }
  revalidatePath("/admin/messages");
  return { ok: true, message: "Message sent — we'll be in touch." };
}
