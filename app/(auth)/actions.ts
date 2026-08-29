"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession } from "@/lib/session";
import { loginSchema, registerSchema } from "@/lib/validators";

export type AuthState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

function safeNext(next: FormDataEntryValue | null): string {
  const n = typeof next === "string" ? next : "";
  return n.startsWith("/") && !n.startsWith("//") ? n : "";
}

const MAX_FAILS = 8;
const WINDOW_MS = 15 * 60 * 1000;

async function clientKey(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown"
  );
}

export async function signUp(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const { name, email, phone, password } = parsed.data;

  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (existing) {
    return { error: "An account with that email already exists. Try signing in." };
  }

  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      phone,
      passwordHash: await bcrypt.hash(password, 10),
      role: "CUSTOMER",
    },
  });

  await createSession({
    userId: user.id,
    role: "CUSTOMER",
    name: user.name,
    email: user.email,
  });

  redirect(safeNext(formData.get("next")) || "/account");
}

export async function signIn(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const { email, password } = parsed.data;

  const key = await clientKey();
  const since = new Date(Date.now() - WINDOW_MS);
  const recentFails = await prisma.loginAttempt.count({
    where: { key, success: false, createdAt: { gte: since } },
  });
  if (recentFails >= MAX_FAILS) {
    return { error: "Too many failed attempts. Wait 15 minutes and try again." };
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  const ok = !!user && (await bcrypt.compare(password, user.passwordHash));

  await prisma.loginAttempt.create({ data: { key, success: ok } });
  if (Math.random() < 0.05) {
    await prisma.loginAttempt.deleteMany({
      where: { createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    });
  }

  if (!ok || !user) {
    return { error: "Wrong email or password." };
  }

  await createSession({
    userId: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
  });

  const next = safeNext(formData.get("next"));
  redirect(next || (user.role === "ADMIN" ? "/admin" : "/account"));
}

export async function signOut() {
  await destroySession();
  redirect("/");
}
