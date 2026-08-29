import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PortraitIllustration } from "@/components/PortraitIllustration";

export const metadata: Metadata = {
  title: "Our Story — Kuri",
  description: "Why Kuri exists, and how Kuri Valley Estate came to be.",
};

const values = [
  {
    title: "Single-origin, always",
    body: "Everything we sell comes from Kuri Valley Estate. No blending in leaf from elsewhere to hit a target flavor.",
  },
  {
    title: "Fair pay to pickers",
    body: "The people who pluck the leaf are paid [FAIR WAGE COMMITMENT] -- not just the estate's lowest legal rate.",
  },
  {
    title: "Small-batch roasting",
    body: "We roast in small batches so each run gets real attention, not a production line's worth of shortcuts.",
  },
];

const milestones = [
  { year: "[YEAR]", label: "The idea", body: "A conversation about why good Bangladeshi tea rarely left Bangladesh." },
  { year: "[YEAR]", label: "First harvest", body: "Our first season working directly with the estate in Sreemangal." },
  { year: "[YEAR]", label: "First shipment", body: "The first bags of Kuri tea reached customers outside Sylhet." },
  { year: "Today", label: "Kuri Valley Estate", body: "One garden, one team, a small and growing list of teas." },
];

export default function OurStoryPage() {
  return (
    <div>
      <div className="wrap py-16 sm:py-20 md:py-28">
        <div className="max-w-[640px]">
          <div className="eyebrow mb-4">Our Story</div>
          <h1 className="font-serif text-[32px] font-medium sm:text-4xl md:text-[46px]">
            Why Kuri exists
          </h1>
          <p className="mt-6 text-base leading-relaxed text-charcoal-2">
            [FOUNDER NAME] started Kuri because Bangladesh grows genuinely good tea, and
            almost none of it was reaching people who&apos;d actually seek it out. Sreemangal
            has been growing tea for generations -- most of it just never got a label people
            outside the region would recognize.
          </p>
        </div>
      </div>

      <div className="bg-cream-2 py-16 sm:py-20 md:py-28">
        <div className="wrap flex flex-col items-center gap-12 md:flex-row md:gap-24">
          <div className="aspect-[4/5] w-full max-w-[360px] overflow-hidden rounded-sm md:flex-1">
            <PortraitIllustration className="h-full w-full" />
          </div>
          <div className="md:flex-1">
            <div className="eyebrow mb-4">The Founder</div>
            <h2 className="font-serif text-3xl font-medium md:text-[34px]">
              [FOUNDER NAME]
            </h2>
            <p className="mt-5 text-base leading-relaxed text-charcoal-2">
              [Two or three sentences on the founder&apos;s background and why they started
              Kuri -- what they did before, what took them to Sreemangal, and what convinced
              them a single-origin approach was worth the extra work. Replace this bracket
              with the real story.]
            </p>
          </div>
        </div>
      </div>

      <div className="wrap py-16 sm:py-24 md:py-32">
        <div className="mb-16 text-center">
          <div className="eyebrow mb-4">How We Got Here</div>
          <h2 className="font-serif text-[26px] font-medium sm:text-3xl md:text-[34px]">A short timeline</h2>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:gap-10 md:grid-cols-4">
          {milestones.map((m) => (
            <div key={m.label} className="border-t-2 border-charcoal pt-5">
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
          src="/images/hero-1.jpg"
          alt="Terraced tea garden hillside in Sreemangal"
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
                <div className="eyebrow mb-4">What We Hold To</div>
            <h2 className="font-serif text-[26px] font-medium sm:text-3xl md:text-[34px]">
                  A few things we don&apos;t compromise on
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
                {values.map((v) => (
                  <div key={v.title}>
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
        <h2 className="font-serif text-3xl font-medium md:text-[36px]">Meet the valley itself.</h2>
        <Link href="/our-origin" className="btn btn-primary mt-3">
          See Our Origin
        </Link>
      </div>
    </div>
  );
}
