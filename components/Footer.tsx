import Link from "next/link";
import { getCategories } from "@/lib/queries";
import { getSettings } from "@/lib/settings";
import { SITE } from "@/lib/site";

function realUrl(v: string) {
  return v && !v.startsWith("[") ? v : null;
}

export async function Footer() {
  const [categories, settings] = await Promise.all([getCategories(), getSettings()]);
  const ig = realUrl(SITE.instagramUrl);
  const fb = realUrl(SITE.facebookUrl);
  const blurb =
    settings.footerBlurb ||
    "Single-origin tea from Kuri Valley Estate, Sreemangal, Bangladesh.";

  return (
    <footer>
      <div className="wrap grid grid-cols-2 gap-10 border-t border-line py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="font-serif text-xl font-semibold tracking-[0.12em]">KURI</div>
          <p className="mt-3 max-w-[260px] text-[13px] leading-relaxed text-muted">{blurb}</p>
        </div>
        <div>
          <div className="mb-4 text-xs font-bold tracking-[0.1em] uppercase">Shop</div>
          <div className="flex flex-col gap-2.5 text-[13px] text-charcoal-2">
            <Link href="/shop">All Tea</Link>
            {categories.map((c) => (
              <Link key={c.id} href={`/shop?category=${c.slug}`}>
                {c.name.replace(/ Tea$/, "")}
              </Link>
            ))}
            <Link href="/subscriptions">Subscriptions</Link>
          </div>
        </div>
        <div>
          <div className="mb-4 text-xs font-bold tracking-[0.1em] uppercase">Learn</div>
          <div className="flex flex-col gap-2.5 text-[13px] text-charcoal-2">
            <Link href="/our-origin">Our Origin</Link>
            <Link href="/our-story">Our Story</Link>
            <Link href="/journal">Journal</Link>
            <Link href="/photo-credits">Photo Credits</Link>
          </div>
        </div>
        <div>
          <div className="mb-4 text-xs font-bold tracking-[0.1em] uppercase">Contact</div>
          <div className="flex flex-col gap-2.5 text-[13px] text-charcoal-2">
            <Link href="/contact">Get in touch</Link>
            {realUrl(SITE.email) && (
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            )}
            {ig && (
              <a href={ig} target="_blank" rel="noopener noreferrer">Instagram</a>
            )}
            {fb && (
              <a href={fb} target="_blank" rel="noopener noreferrer">Facebook</a>
            )}
          </div>
        </div>
      </div>
      <div className="wrap flex flex-col items-center gap-3 border-t border-line py-6 text-center text-xs text-muted-2 sm:text-left md:flex-row md:items-center md:justify-between">
        <div>
          &copy; {new Date().getFullYear()} Kuri Valley Estate. Sreemangal, Bangladesh.
        </div>
        <div className="text-muted-2">{SITE.address}</div>
      </div>
    </footer>
  );
}
