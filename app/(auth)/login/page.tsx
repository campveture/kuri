import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Sign in — Kuri" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect(next || (user.role === "ADMIN" ? "/admin" : "/account"));
  return <LoginForm next={next} />;
}
