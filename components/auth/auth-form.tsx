"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signIn, signUp, type AuthState } from "@/app/(auth)/actions";

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="mt-1 text-xs text-negative">{errors[0]}</p>;
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary w-full" disabled={pending}>
      {pending ? "Please wait…" : label}
    </button>
  );
}

function ErrorNote({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <p className="border border-[#b03636]/40 bg-[#b03636]/10 px-3 py-2 text-xs text-negative">
      {error}
    </p>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState<AuthState, FormData>(signIn, {});
  return (
    <div>
      <h1 className="h-display text-4xl">Welcome back</h1>
      <p className="mt-2 text-sm text-muted">
        Sign in to track orders and check out faster.
      </p>

      <form action={action} className="mt-8 space-y-4">
        {next ? <input type="hidden" name="next" value={next} /> : null}
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className="input"
            placeholder="you@email.com"
            required
          />
          <FieldError errors={state.fieldErrors?.email} />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            className="input"
            placeholder="••••••••"
            required
          />
          <FieldError errors={state.fieldErrors?.password} />
        </div>

        <ErrorNote error={state.error} />
        <SubmitButton label="Sign in" />
      </form>

      <p className="mt-6 text-sm text-muted">
        New here?{" "}
        <Link
          href={next ? `/register?next=${encodeURIComponent(next)}` : "/register"}
          className="text-gold-deep hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}

export function RegisterForm({ next }: { next?: string }) {
  const [state, action] = useActionState<AuthState, FormData>(signUp, {});
  return (
    <div>
      <h1 className="h-display text-4xl">Create your account</h1>
      <p className="mt-2 text-sm text-muted">
        One account for checkout, order tracking and subscriptions.
      </p>

      <form action={action} className="mt-8 space-y-4">
        {next ? <input type="hidden" name="next" value={next} /> : null}
        <div>
          <label className="label" htmlFor="name">Full name</label>
          <input id="name" name="name" className="input" required />
          <FieldError errors={state.fieldErrors?.name} />
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" className="input" required />
          <FieldError errors={state.fieldErrors?.email} />
        </div>
        <div>
          <label className="label" htmlFor="phone">Phone</label>
          <input id="phone" name="phone" inputMode="tel" className="input" placeholder="01XXXXXXXXX" required />
          <FieldError errors={state.fieldErrors?.phone} />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" name="password" type="password" autoComplete="new-password" className="input" required />
          <FieldError errors={state.fieldErrors?.password} />
        </div>

        <ErrorNote error={state.error} />
        <SubmitButton label="Create account" />
      </form>

      <p className="mt-6 text-sm text-muted">
        Already have an account?{" "}
        <Link
          href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}
          className="text-gold-deep hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
