import type { Metadata } from "next";
import Link from "next/link";
import { FaqAccordion } from "@/components/FaqAccordion";

export const metadata: Metadata = {
  title: "Subscriptions — Kuri",
  description: "Subscribe to Kuri tea and save 10% on every order, delivered on your schedule.",
};

const steps = [
  {
    title: "Choose your tea & frequency",
    body: "Pick any tea from the shop and select \"Subscribe & save\" at checkout, then choose how often it ships.",
  },
  {
    title: "We roast and ship fresh",
    body: "Each order is packed close to your ship date, not pulled from a warehouse shelf that's been sitting for months.",
  },
  {
    title: "Adjust or cancel anytime",
    body: "Change your tea, change your frequency, or cancel outright -- no minimum commitment.",
  },
];

const frequencies = ["Every 4 weeks", "Every 6 weeks", "Every 8 weeks"];

const faqs = [
  {
    question: "How much do I save?",
    answer: "Subscriptions are 10% off the one-time price on every tea, every order, for as long as the subscription runs.",
  },
  {
    question: "Can I change which tea I get?",
    answer: "Yes -- you can swap teas, change quantity, or change frequency before each order ships. [Details on how this works once account management is built.]",
  },
  {
    question: "When am I charged?",
    answer: "You're charged when each order ships, not in advance. [Confirm exact billing timing once a payment processor is connected.]",
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes, there's no minimum number of shipments and no cancellation fee.",
  },
];

export default function SubscriptionsPage() {
  return (
    <div>
      <div className="wrap py-20 md:py-28">
        <div className="max-w-[640px]">
          <div className="eyebrow mb-4">Subscriptions</div>
          <h1 className="font-serif text-4xl font-medium md:text-[46px]">
            Never run out of tea.
          </h1>
          <p className="mt-6 text-base leading-relaxed text-charcoal-2">
            Subscribe to any tea in the shop and save 10% on every order, delivered on
            whatever schedule actually matches how much you drink.
          </p>
          <Link href="/shop" className="btn btn-primary mt-8 w-fit">
            Start a Subscription
          </Link>
        </div>
      </div>

      <div className="bg-cream-2 py-24 md:py-28">
        <div className="wrap">
          <div className="mb-16 text-center">
            <div className="eyebrow mb-4">How It Works</div>
            <h2 className="font-serif text-3xl font-medium md:text-[34px]">Three steps</h2>
          </div>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.title}>
                <div className="step-num">0{i + 1}</div>
                <div className="mt-2 mb-2 font-serif text-lg font-medium">{step.title}</div>
                <p className="text-[14px] leading-relaxed text-muted">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="wrap py-24 md:py-28">
        <div className="mb-14 text-center">
          <div className="eyebrow mb-4">Choose a Rhythm</div>
          <h2 className="font-serif text-3xl font-medium md:text-[34px]">Pick a frequency</h2>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {frequencies.map((f) => (
            <div key={f} className="border border-line p-8 text-center">
              <div className="chip mb-4 inline-block">Save 10%</div>
              <div className="font-serif text-xl font-medium">{f}</div>
              <p className="mt-3 text-[13px] leading-relaxed text-muted">
                Applies to any tea in the shop, changeable anytime.
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="wrap pb-24 md:pb-32">
        <div className="mb-12">
          <div className="eyebrow mb-4">Questions</div>
          <h2 className="font-serif text-3xl font-medium md:text-[34px]">FAQ</h2>
        </div>
        <FaqAccordion items={faqs} />
      </div>
    </div>
  );
}
