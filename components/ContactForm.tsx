"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitContact, type FormResult } from "@/app/(site)/actions";

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn btn-primary w-fit disabled:opacity-50">
      {pending ? "Sending…" : "Send Message"}
    </button>
  );
}

export function ContactForm({ contactEmail }: { contactEmail?: string }) {
  const [state, action] = useActionState<FormResult, FormData>(submitContact, {});
  const mailto =
    contactEmail && !contactEmail.startsWith("[")
      ? `mailto:${contactEmail}`
      : null;

  if (state.ok) {
    return (
      <div className="border border-green bg-[rgba(63,92,67,0.08)] px-5 py-6">
        <p className="font-serif text-lg text-green">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-5">
      <div>
        <label htmlFor="cf-name" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-2">
          Name
        </label>
        <input
          id="cf-name"
          name="name"
          type="text"
          required
          className="w-full border border-line bg-transparent px-4 py-3 text-sm outline-none focus:border-charcoal"
        />
      </div>
      <div>
        <label htmlFor="cf-email" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-2">
          Email
        </label>
        <input
          id="cf-email"
          name="email"
          type="email"
          required
          className="w-full border border-line bg-transparent px-4 py-3 text-sm outline-none focus:border-charcoal"
        />
      </div>
      <div>
        <label htmlFor="cf-topic" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-2">
          Topic
        </label>
        <select
          id="cf-topic"
          name="topic"
          defaultValue="General"
          className="w-full border border-line bg-transparent px-4 py-3 text-sm outline-none focus:border-charcoal"
        >
          <option>General</option>
          <option>Wholesale</option>
          <option>Press</option>
          <option>Order Support</option>
          <option>Other</option>
        </select>
      </div>
      <div>
        <label htmlFor="cf-message" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-2">
          Message
        </label>
        <textarea
          id="cf-message"
          name="message"
          required
          rows={5}
          className="w-full border border-line bg-transparent px-4 py-3 text-sm outline-none focus:border-charcoal"
        />
      </div>

      {state.error && <p className="text-xs text-negative">{state.error}</p>}

      <SubmitBtn />
      {mailto && (
        <p className="text-xs text-muted-2">
          Prefer email? Write to us at{" "}
          <a href={mailto} className="underline">
            {contactEmail}
          </a>
          .
        </p>
      )}
    </form>
  );
}
