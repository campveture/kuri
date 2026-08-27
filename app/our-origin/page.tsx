import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HeroParticles } from "@/components/HeroParticles";
import { LeafQuoteIcon } from "@/components/Icons";
import { DryIcon, OxidiseIcon, PluckIcon, RollIcon, WitherIcon } from "@/components/ProcessIcons";

export const metadata: Metadata = {
  title: "Our Origin — Kuri Valley Estate, Sreemangal",
  description:
    "Kuri Valley Estate: a single family-run tea garden in Sreemangal, Sylhet, Bangladesh.",
};

const stats = [
  { label: "Region", value: "Sreemangal, Sylhet" },
  { label: "Elevation", value: "[ALTITUDE] m" },
  { label: "Established", value: "[YEAR]" },
  { label: "Harvest", value: "[SEASON] Flush" },
];

const steps = [
  {
    icon: PluckIcon,
    title: "Pluck",
    body: "Two leaves and a bud, by hand, at first light.",
  },
  {
    icon: WitherIcon,
    title: "Wither",
    body: "Spread thin, air-dried until soft and pliable.",
  },
  {
    icon: RollIcon,
    title: "Roll",
    body: "Hand-rolled to break the leaf and release oils.",
  },
  {
    icon: OxidiseIcon,
    title: "Oxidise",
    body: "Timed by feel and smell, not by the clock alone.",
  },
  {
    icon: DryIcon,
    title: "Dry & Sort",
    body: "Fired to lock in flavor, then graded by hand.",
  },
];

export default function OurOriginPage() {
  return (
    <div>
      {/* Hero */}
      <div className="relative h-[420px] overflow-hidden md:h-[480px]">
        <Image
          src="/images/shop-banner.jpg"
          alt="A path through tea garden rows in Sreemangal, Bangladesh"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[rgba(43,36,28,0.6)]" />
        <HeroParticles
          color={0xc89a3e}
          count={34}
          opacity={0.7}
          size={4}
          className="absolute inset-0 h-full w-full"
        />
        <div className="wrap relative flex h-full flex-col items-start justify-center">
          <div className="mb-5 text-xs tracking-wide text-line">Home&nbsp;/&nbsp;Our Origin</div>
          <div className="eyebrow mb-3.5">Sreemangal, Sylhet Division, Bangladesh</div>
          <h1 className="font-serif text-4xl font-medium text-cream md:text-[52px]">
            Kuri Valley Estate
          </h1>
        </div>
      </div>

      {/* The region */}
      <div className="wrap py-24 md:py-28">
        <div className="flex flex-col gap-12 md:flex-row md:gap-24">
          <div className="md:w-[300px] md:shrink-0">
            <div className="eyebrow mb-4">01 &mdash; The Region</div>
            <h2 className="font-serif text-3xl font-medium md:text-[34px]">
              Bangladesh&apos;s tea country
            </h2>
          </div>
          <div className="max-w-[640px]">
            <p className="text-base leading-relaxed text-charcoal-2">
              Sreemangal is Bangladesh&apos;s tea capital &mdash; rolling hills, pineapple
              groves, and more than a hundred gardens spread across Sylhet division in the
              country&apos;s northeast. The climate here, warm and wet for most of the year,
              is what lets tea grow at all this far from the Himalayan gardens most people
              picture when they think of South Asian tea.
            </p>
          </div>
        </div>
        <div className="mt-16 flex flex-wrap gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="min-w-[190px] border border-line px-6 py-4.5">
              <div className="spec-label">{stat.label}</div>
              <div className="font-serif text-lg">{stat.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* The estate: full-bleed photo with a floating card, Luxmi-style */}
      <div className="relative h-[70vh] min-h-[440px] overflow-hidden md:h-[600px]">
        <Image
          src="/images/teaser-1.jpg"
          alt="Close-up of tea leaves at Sreemangal's tea gardens"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div
          className="absolute inset-x-6 bottom-8 bg-[rgba(247,242,230,0.94)] p-8 md:inset-x-auto md:bottom-12 md:right-16 md:w-[440px] md:p-10"
        >
          <div className="eyebrow mb-3.5">02 &mdash; The Estate</div>
          <h2 className="font-serif text-3xl font-medium md:text-[34px]">One garden, one team</h2>
          <p className="mt-5 text-base leading-relaxed text-charcoal-2">
            Kuri Valley is a single, family-run garden &mdash; not a cooperative of many
            small plots blended together. The same pickers return season after season;
            many have worked these rows for [X] years. What goes into a Kuri bag came off
            one hillside, picked by people who know it by name, not by lot number.
          </p>
        </div>
      </div>

      {/* Process */}
      <div className="wrap py-24 md:py-28">
        <div className="mb-16 text-center">
          <div className="eyebrow mb-4">03 &mdash; The Process</div>
          <h2 className="font-serif text-3xl font-medium md:text-[34px]">Leaf to cup</h2>
        </div>
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="text-center">
                <div className="mx-auto mb-4.5 flex h-[68px] w-[68px] items-center justify-center rounded-full border border-line bg-cream-2">
                  <Icon />
                </div>
                <div className="step-num">0{i + 1}</div>
                <div className="mt-1.5 mb-2 text-sm font-semibold">{step.title}</div>
                <div className="text-[13px] leading-relaxed text-muted">{step.body}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quote band */}
      <div className="bg-charcoal py-28 text-cream md:py-32">
        <div className="wrap max-w-[820px] text-center">
          <LeafQuoteIcon className="mx-auto mb-7 block" />
          <div className="font-serif text-2xl italic leading-relaxed md:text-[30px]">
            &ldquo;The valley decides the harvest. We just try not to get in the way.&rdquo;
          </div>
          <div className="mt-7 text-xs tracking-[0.12em] text-gold uppercase">
            Kuri Valley Estate &middot; Sreemangal
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="wrap py-24 text-center md:py-28">
        <h2 className="font-serif text-3xl font-medium md:text-[36px]">Taste the valley.</h2>
        <Link href="/shop" className="btn btn-primary mx-auto mt-7 w-fit">
          Shop Our Teas
        </Link>
      </div>
    </div>
  );
}
