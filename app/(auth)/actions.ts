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
  const n = typeof next === "string" ? next.trim() : "";
  // Only same-origin absolute paths. Reject protocol-relative (`//`, `/\`),
  // backslashes, and control chars — several browsers normalise `\` to `/`.
  if (!n.startsWith("/") || n.startsWith("//") || /[\\\x00-\x1f]/.test(n)) return "";
  return n;
}

const MAX_FAILS = 8;
const WINDOW_MS = 15 * 60 * 1000;
// A bcrypt hash to compare against when the email is unknown, so sign-in takes
// the same time whether or not the account exists (no timing oracle).
const DUMMY_HASH = "$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq4iVUM7pW6O8w3xq7yq7yq7yq7yqe";

async function clientKey(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown"
  );
}

async function tooManyAttempts(key: string): Promise<boolean> {
  const since = new Date(Date.now() - WINDOW_MS);
  const fails = await prisma.loginAttempt.count({
    where: { key, success: false, createdAt: { gte: since } },
  });
  return fails >= MAX_FAILS;
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

  const key = await clientKey();
  if (await tooManyAttempts(key)) {
    return { error: "Too many attempts. Wait 15 minutes and try again." };
  }

  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (existing) {
    await prisma.loginAttempt.create({ data: { key, success: false } });
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
  if (await tooManyAttempts(key)) {
    return { error: "Too many failed attempts. Wait 15 minutes and try again." };
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  // Always run a bcrypt compare so response time doesn't reveal whether the
  // account exists.
  const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);

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
