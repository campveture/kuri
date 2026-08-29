import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HeroParticles } from "@/components/HeroParticles";
import { LeafQuoteIcon } from "@/components/Icons";
import { DryIcon, OxidiseIcon, PluckIcon, RollIcon, WitherIcon } from "@/components/ProcessIcons";
import { getPageContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Our Origin — Kuri Valley Estate, Sreemangal",
  description:
    "Kuri Valley Estate: a single family-run tea garden in Sreemangal, Sylhet, Bangladesh.",
};

const STEP_ICONS = [PluckIcon, WitherIcon, RollIcon, OxidiseIcon, DryIcon];

export default async function OurOriginPage() {
  const c = await getPageContent("our-origin");

  return (
    <div>
      {/* Hero */}
      <div className="relative h-[320px] overflow-hidden sm:h-[420px] md:h-[480px]">
        <Image
          src={c.hero.image}
          alt={c.hero.imageAlt}
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
          <div className="mb-5 text-xs tracking-wide text-line">{c.hero.breadcrumb}</div>
          <div className="eyebrow mb-3.5">{c.hero.eyebrow}</div>
          <h1 className="font-serif text-[32px] font-medium text-cream sm:text-4xl md:text-[52px]">
            {c.hero.headline}
          </h1>
        </div>
      </div>

      {/* The region */}
      <div className="wrap py-16 sm:py-20 md:py-28">
        <div className="flex flex-col gap-12 md:flex-row md:gap-24">
          <div className="md:w-[300px] md:shrink-0">
            <div className="eyebrow mb-4">{c.region.eyebrow}</div>
            <h2 className="font-serif text-[26px] font-medium sm:text-3xl md:text-[34px]">
              {c.region.heading}
            </h2>
          </div>
          <div className="max-w-[640px]">
            <p className="text-base leading-relaxed text-charcoal-2">
              {c.region.body}
            </p>
          </div>
        </div>
        <div className="mt-16 flex flex-wrap gap-6">
          {c.region.stats.map((stat, i) => (
            <div key={i} className="min-w-[190px] border border-line px-6 py-4.5">
              <div className="spec-label">{stat.label}</div>
              <div className="font-serif text-lg">{stat.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* The estate: full-bleed photo with a floating card, Luxmi-style */}
      <div className="relative h-[70vh] min-h-[440px] overflow-hidden md:h-[600px]">
        <Image
          src={c.estate.image}
          alt={c.estate.imageAlt}
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div
          className="absolute inset-x-6 bottom-8 bg-[rgba(247,242,230,0.94)] p-8 md:inset-x-auto md:bottom-12 md:right-16 md:w-[440px] md:p-10"
        >
          <div className="eyebrow mb-3.5">{c.estate.eyebrow}</div>
          <h2 className="font-serif text-3xl font-medium md:text-[34px]">{c.estate.heading}</h2>
          <p className="mt-5 text-base leading-relaxed text-charcoal-2">
            {c.estate.body}
          </p>
        </div>
      </div>

      {/* Process */}
      <div className="wrap py-24 md:py-28">
        <div className="mb-16 text-center">
          <div className="eyebrow mb-4">{c.process.eyebrow}</div>
          <h2 className="font-serif text-3xl font-medium md:text-[34px]">{c.process.heading}</h2>
        </div>
        <div className="grid grid-cols-2 gap-6 sm:gap-8 md:gap-10 md:grid-cols-5">
          {c.process.steps.map((step, i) => {
            const Icon = STEP_ICONS[i];
            return (
              <div key={i} className="text-center">
                <div className="mx-auto mb-4.5 flex h-[68px] w-[68px] items-center justify-center rounded-full border border-line bg-cream-2">
                  {Icon ? <Icon /> : null}
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
      <div className="bg-charcoal py-20 text-cream sm:py-28 md:py-32">
        <div className="wrap max-w-[820px] text-center">
          <LeafQuoteIcon className="mx-auto mb-7 block" />
          <div className="font-serif text-xl italic leading-relaxed sm:text-2xl md:text-[30px]">
            {c.quote.text}
          </div>
          <div className="mt-7 text-xs tracking-[0.12em] text-gold uppercase">
            {c.quote.attribution}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="wrap py-16 text-center sm:py-20 md:py-28">
        <h2 className="font-serif text-3xl font-medium md:text-[36px]">{c.cta.heading}</h2>
        <Link href="/shop" className="btn btn-primary mx-auto mt-7 w-fit">
          {c.cta.buttonLabel}
        </Link>
      </div>
    </div>
  );
}
