import type { Metadata } from "next";
import Link from "next/link";
import { FaqAccordion } from "@/components/FaqAccordion";
import { getPageContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Subscriptions — Kuri",
  description: "Subscribe to Kuri tea and save 10% on every order, delivered on your schedule.",
};

export default async function SubscriptionsPage() {
  const c = await getPageContent("subscriptions");

  return (
    <div>
      <div className="wrap py-16 sm:py-20 md:py-28">
        <div className="max-w-[640px]">
          <div className="eyebrow mb-4">{c.hero.eyebrow}</div>
          <h1 className="font-serif text-[32px] font-medium sm:text-4xl md:text-[46px]">
            {c.hero.headline}
          </h1>
          <p className="mt-6 text-base leading-relaxed text-charcoal-2">
            {c.hero.body}
          </p>
          <Link href="/shop" className="btn btn-primary mt-8 w-fit">
            {c.hero.buttonLabel}
          </Link>
        </div>
      </div>

      <div className="bg-cream-2 py-16 sm:py-20 md:py-28">
        <div className="wrap">
          <div className="mb-16 text-center">
            <div className="eyebrow mb-4">{c.howItWorks.eyebrow}</div>
            <h2 className="font-serif text-[26px] font-medium sm:text-3xl md:text-[34px]">{c.howItWorks.heading}</h2>
          </div>
          <div className="grid grid-cols-1 gap-10 sm:gap-12 md:grid-cols-3">
            {c.howItWorks.steps.map((step, i) => (
              <div key={i}>
                <div className="step-num">0{i + 1}</div>
                <div className="mt-2 mb-2 font-serif text-lg font-medium">{step.title}</div>
                <p className="text-[14px] leading-relaxed text-muted">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="wrap py-16 sm:py-20 md:py-28">
        <div className="mb-14 text-center">
          <div className="eyebrow mb-4">{c.frequency.eyebrow}</div>
          <h2 className="font-serif text-[26px] font-medium sm:text-3xl md:text-[34px]">{c.frequency.heading}</h2>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {c.frequency.options.map((f, i) => (
            <div key={i} className="border border-line p-8 text-center">
              <div className="chip mb-4 inline-block">{c.frequency.chipLabel}</div>
              <div className="font-serif text-xl font-medium">{f.label}</div>
              <p className="mt-3 text-[13px] leading-relaxed text-muted">
                {c.frequency.note}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="wrap pb-16 sm:pb-20 md:pb-32">
        <div className="mb-12">
          <div className="eyebrow mb-4">{c.faq.eyebrow}</div>
          <h2 className="font-serif text-[26px] font-medium sm:text-3xl md:text-[34px]">{c.faq.heading}</h2>
        </div>
        <FaqAccordion items={c.faq.items} />
      </div>
    </div>
  );
}
