import Image from "next/image";
import Link from "next/link";
import { getAllProducts } from "@/lib/commerce";
import { ProductCard } from "@/components/ProductCard";
import { HeroParticles } from "@/components/HeroParticles";
import { LeafQuoteIcon, ArrowRightIcon } from "@/components/Icons";
import { Reveal } from "@/components/Reveal";
import { Parallax } from "@/components/Parallax";

function HeroLine({ children, delay }: { children: React.ReactNode; delay: number }) {
  return (
    <span className="hero-line">
      <span style={{ animationDelay: `${delay}ms` }}>{children}</span>
    </span>
  );
}

export default function HomePage() {
  const products = getAllProducts();

  return (
    <div>
      {/* Hero */}
      <div className="grain relative h-[85vh] min-h-[560px] overflow-hidden">
        <Image
          src="/images/hero-2.jpg"
          alt="Close-up of a tea bush at a Sreemangal tea garden, Bangladesh"
          fill
          priority
          sizes="100vw"
          className="hero-img object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to top, rgba(43,36,28,0.75) 0%, rgba(43,36,28,0.2) 50%, rgba(43,36,28,0.08) 100%)",
          }}
        />
        <HeroParticles
          color={0xc89a3e}
          count={64}
          opacity={0.6}
          size={4.5}
          className="absolute inset-0 h-full w-full"
        />
        <div className="wrap relative flex h-full flex-col items-start justify-end pb-24 md:justify-center md:pb-0">
          <HeroLine delay={150}>
            <span className="eyebrow mb-4 block text-gold">Sreemangal, Bangladesh</span>
          </HeroLine>
          <h1 className="font-serif text-[34px] font-medium leading-tight text-cream md:text-[62px]">
            <HeroLine delay={350}>Tea from one valley</HeroLine>
            <HeroLine delay={500}>
              in <em className="gold-shimmer not-italic">Sreemangal.</em>
            </HeroLine>
          </h1>
          <HeroLine delay={700}>
            <span className="mt-5 block max-w-[480px] text-[15px] leading-relaxed text-[rgba(247,242,230,0.9)] md:text-[17px]">
              Kuri Valley Estate sits in the hills of Sylhet&apos;s tea country. We pick,
              process, and pack from a single garden &mdash; no blending, no averaging, just
              the valley as it is.
            </span>
          </HeroLine>
          <HeroLine delay={900}>
            <span className="mt-8 block">
              <Link href="/shop" className="btn btn-on-dark">
                Shop Our Teas
              </Link>
            </span>
          </HeroLine>
        </div>
        {/* Scroll indicator */}
        <HeroLine delay={1300}>
          <span className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex">
            <span className="text-[10px] font-semibold tracking-[0.28em] text-[rgba(247,242,230,0.7)] uppercase">
              Scroll
            </span>
            <span className="float-slow block h-10 w-px bg-gradient-to-b from-gold to-transparent" />
          </span>
        </HeroLine>
      </div>

      {/* Marquee band */}
      <div className="marquee bg-charcoal py-5" style={{ ["--marquee-speed" as string]: "42s" }}>
        {[0, 1].map((copy) => (
          <div key={copy} className="marquee-track" aria-hidden={copy === 1}>
            {[
              "Single Estate",
              "Sreemangal, Sylhet",
              "First Flush",
              "Hand Plucked",
              "Small Batch",
              "No Blending",
            ].map((phrase) => (
              <span key={phrase} className="flex items-center gap-12 whitespace-nowrap">
                <span className="font-serif text-lg italic text-cream md:text-xl">{phrase}</span>
                <span className="text-gold">&#10051;</span>
              </span>
            ))}
          </div>
        ))}
      </div>

      {/* Origin teaser: full-bleed photo with a floating, drifting card */}
      <div className="grain relative h-[80vh] min-h-[480px] overflow-hidden md:h-[640px]">
        <Image
          src="/images/hero-1.jpg"
          alt="Terraced tea garden hillside in Sreemangal"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <Parallax
          strength={55}
          className="absolute inset-x-6 bottom-10 md:inset-x-auto md:bottom-16 md:left-16 md:w-[440px]"
        >
          <Reveal>
            <div className="bg-[rgba(247,242,230,0.94)] p-8 shadow-[0_24px_60px_rgba(43,36,28,0.35)] backdrop-blur-sm md:p-10">
              <div className="eyebrow mb-3.5">Our Origin</div>
              <h2 className="font-serif text-3xl font-medium md:text-[36px]">Kuri Valley Estate</h2>
              <p className="mt-5 text-base leading-relaxed text-charcoal-2">
                Sreemangal has grown tea since [YEAR]. Ours comes from one estate, one elevation
                band, one team of pickers who know these rows by hand &mdash; season after
                season, the same hillside, the same hands.
              </p>
              <Link
                href="/our-origin"
                className="link-sweep mt-6 flex w-fit items-center gap-2 text-sm font-semibold"
              >
                <span>Discover Our Origin</span>
                <ArrowRightIcon />
              </Link>
            </div>
          </Reveal>
        </Parallax>
      </div>

      {/* Featured collection */}
      <div className="bg-cream-2 py-24 md:py-28">
        <div className="wrap">
          <Reveal>
            <div className="mb-14 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
              <div>
                <div className="eyebrow mb-4">The Collection</div>
                <h2 className="font-serif text-3xl font-medium md:text-[34px]">
                  From this season&apos;s harvest
                </h2>
              </div>
              <Link href="/shop" className="btn btn-outline">
                View All Tea
              </Link>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
            {products.map((product, i) => (
              <Reveal key={product.handle} delay={i * 120}>
                <ProductCard product={product} imageBg="bg-cream" />
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* Quote band */}
      <div className="bg-charcoal py-28 text-cream md:py-32">
        <div className="wrap max-w-[820px] text-center">
          <Reveal>
            <LeafQuoteIcon className="float-slow mx-auto mb-7 block" />
            <div className="font-serif text-2xl italic leading-relaxed md:text-[30px]">
              &ldquo;We don&apos;t buy tea. We grow{" "}
              <span className="gold-shimmer">one hillside</span>, and drink what it gives
              us.&rdquo;
            </div>
            <div className="mt-7 text-xs tracking-[0.12em] text-gold uppercase">
              Kuri Valley Estate &middot; Sreemangal
            </div>
          </Reveal>
        </div>
      </div>

      {/* Newsletter */}
      <Reveal>
        <div className="wrap flex flex-col items-start justify-between gap-8 border-b border-line py-20 md:flex-row md:items-center">
          <div className="max-w-[420px]">
            <h3 className="font-serif text-2xl font-medium">Get first access to new harvests</h3>
            <p className="mt-2.5 text-sm text-muted">
              One email, a few times a season. No spam, just fresh tea when it lands.
            </p>
          </div>
          <form className="flex w-full max-w-[420px] border border-charcoal md:min-w-[380px]">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 bg-transparent px-4 py-4 text-sm outline-none"
            />
            <button type="submit" className="whitespace-nowrap bg-charcoal px-6 py-4 text-xs font-semibold tracking-wide text-cream uppercase">
              Subscribe
            </button>
          </form>
        </div>
      </Reveal>
    </div>
  );
}
