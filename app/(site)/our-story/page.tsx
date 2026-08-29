import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PortraitIllustration } from "@/components/PortraitIllustration";
import { getPageContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Our Story — Kuri",
  description: "Why Kuri exists, and how Kuri Valley Estate came to be.",
};

export default async function OurStoryPage() {
  const c = await getPageContent("our-story");

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
        </div>
      </div>

      <div className="bg-cream-2 py-16 sm:py-20 md:py-28">
        <div className="wrap flex flex-col items-center gap-12 md:flex-row md:gap-24">
          <div className="aspect-[4/5] w-full max-w-[360px] overflow-hidden rounded-sm md:flex-1">
            <PortraitIllustration className="h-full w-full" />
          </div>
          <div className="md:flex-1">
            <div className="eyebrow mb-4">{c.founder.eyebrow}</div>
            <h2 className="font-serif text-3xl font-medium md:text-[34px]">
              {c.founder.name}
            </h2>
            <p className="mt-5 text-base leading-relaxed text-charcoal-2">
              {c.founder.body}
            </p>
          </div>
        </div>
      </div>

      <div className="wrap py-16 sm:py-24 md:py-32">
        <div className="mb-16 text-center">
          <div className="eyebrow mb-4">{c.timeline.eyebrow}</div>
          <h2 className="font-serif text-[26px] font-medium sm:text-3xl md:text-[34px]">{c.timeline.heading}</h2>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:gap-10 md:grid-cols-4">
          {c.timeline.milestones.map((m, i) => (
            <div key={i} className="border-t-2 border-charcoal pt-5">
              <div className="font-serif text-lg text-gold-deep">{m.year}</div>
              <div className="mt-2 text-sm font-semibold">{m.label}</div>
              <div className="mt-2 text-[13px] leading-relaxed text-muted">{m.body}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Values: full-bleed photo with a floating card cluster, Luxmi-style */}
      <div className="relative min-h-[620px] overflow-hidden md:min-h-[680px]">
        <Image
          src={c.values.image}
          alt={c.values.imageAlt}
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="relative flex min-h-[620px] items-end md:min-h-[680px]">
          <div className="wrap w-full pb-10 md:pb-14">
            <div
              className="bg-[rgba(247,242,230,0.94)] p-8 md:p-12"
            >
              <div className="mb-10 max-w-[560px]">
                <div className="eyebrow mb-4">{c.values.eyebrow}</div>
            <h2 className="font-serif text-[26px] font-medium sm:text-3xl md:text-[34px]">
                  {c.values.heading}
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
                {c.values.items.map((v, i) => (
                  <div key={i}>
                    <div className="font-serif text-lg font-medium">{v.title}</div>
                    <p className="mt-3 text-[14px] leading-relaxed text-muted">{v.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="wrap flex flex-col items-center gap-5 py-16 text-center sm:py-20 md:py-28">
        <h2 className="font-serif text-3xl font-medium md:text-[36px]">{c.cta.heading}</h2>
        <Link href="/our-origin" className="btn btn-primary mt-3">
          {c.cta.buttonLabel}
        </Link>
      </div>
    </div>
  );
}
