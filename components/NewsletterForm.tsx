"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { subscribeEmail, type FormResult } from "@/app/(site)/actions";

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="whitespace-nowrap bg-charcoal px-6 py-4 text-xs font-semibold tracking-wide text-cream uppercase disabled:opacity-50"
    >
      {pending ? "…" : "Subscribe"}
    </button>
  );
}

export function NewsletterForm({ source = "newsletter" }: { source?: string }) {
  const [state, action] = useActionState<FormResult, FormData>(subscribeEmail, {});

  if (state.ok) {
    return (
      <p className="w-full max-w-[420px] border border-green bg-[rgba(63,92,67,0.08)] px-4 py-4 text-sm text-green md:min-w-[380px]">
        {state.message}
      </p>
    );
  }

  return (
    <div className="w-full max-w-[420px] md:min-w-[380px]">
      <form action={action} className="flex flex-col border border-charcoal sm:flex-row">
        <input type="hidden" name="source" value={source} />
        <label htmlFor="nl-email" className="sr-only">
          Email address
        </label>
        <input
          id="nl-email"
          name="email"
          type="email"
          required
          placeholder="Your email address"
          className="flex-1 bg-transparent px-4 py-4 text-sm outline-none"
        />
        <SubmitBtn />
      </form>
      {state.error && <p className="mt-2 text-xs text-negative">{state.error}</p>}
    </div>
  );
}
