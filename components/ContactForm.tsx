"use client";

import { useState, type FormEvent } from "react";

const FALLBACK_CONTACT_EMAIL = "[EMAIL]"; // replace with a real inbox

export function ContactForm({ contactEmail }: { contactEmail?: string }) {
  const [topic, setTopic] = useState("General");
  const recipient = contactEmail || FALLBACK_CONTACT_EMAIL;

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const message = (form.elements.namedItem("message") as HTMLTextAreaElement).value;

    const subject = encodeURIComponent(`[Kuri website] ${topic} inquiry from ${name}`);
    const body = encodeURIComponent(`${message}\n\n---\nFrom: ${name} (${email})`);
    window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label htmlFor="name" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-2">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="w-full border border-line bg-transparent px-4 py-3 text-sm outline-none focus:border-charcoal"
        />
      </div>
      <div>
        <label htmlFor="email" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-2">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full border border-line bg-transparent px-4 py-3 text-sm outline-none focus:border-charcoal"
        />
      </div>
      <div>
        <label htmlFor="topic" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-2">
          Topic
        </label>
        <select
          id="topic"
          name="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
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
        <label htmlFor="message" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-2">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="w-full border border-line bg-transparent px-4 py-3 text-sm outline-none focus:border-charcoal"
        />
      </div>
      <button type="submit" className="btn btn-primary w-fit">
        Send Message
      </button>
      <p className="text-xs text-muted-2">
        This opens your email app with the message pre-filled -- there&apos;s no contact-form
        backend wired up yet.
      </p>
    </form>
  );
}
