import Link from "next/link";

export function Footer() {
  return (
    <footer>
      <div className="wrap grid grid-cols-2 gap-10 border-t border-line py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="font-serif text-xl font-semibold tracking-[0.12em]">KURI</div>
          <p className="mt-3 max-w-[260px] text-[13px] leading-relaxed text-muted">
            Single-origin tea from Kuri Valley Estate, Sreemangal, Bangladesh.
          </p>
        </div>
        <div>
          <div className="mb-4 text-xs font-bold tracking-[0.1em] uppercase">Shop</div>
          <div className="flex flex-col gap-2.5 text-[13px] text-charcoal-2">
            <Link href="/shop">All Tea</Link>
            <Link href="/shop">Black</Link>
            <Link href="/shop">Green</Link>
            <Link href="/shop">Oolong</Link>
            <Link href="/subscriptions">Subscriptions</Link>
          </div>
        </div>
        <div>
          <div className="mb-4 text-xs font-bold tracking-[0.1em] uppercase">Learn</div>
          <div className="flex flex-col gap-2.5 text-[13px] text-charcoal-2">
            <Link href="/our-origin">Our Origin</Link>
            <Link href="/our-story">Our Story</Link>
            <Link href="/journal/how-to-brew-a-proper-cup">Brewing Guide</Link>
            <Link href="/journal">Journal</Link>
          </div>
        </div>
        <div>
          <div className="mb-4 text-xs font-bold tracking-[0.1em] uppercase">Support</div>
          <div className="flex flex-col gap-2.5 text-[13px] text-charcoal-2">
            <Link href="/contact">Contact</Link>
            <span className="text-[rgba(61,52,39,0.5)]">Shipping &amp; Returns</span>
            <span className="text-[rgba(61,52,39,0.5)]">FAQ</span>
          </div>
        </div>
      </div>
      <div className="wrap flex flex-col gap-3 border-t border-line py-6 text-xs text-muted-2 md:flex-row md:items-center md:justify-between">
        <div>&copy; {new Date().getFullYear()} Kuri Valley Estate. Sreemangal, Bangladesh.</div>
        <div className="flex gap-4">
          <span>Instagram</span>
          <span>Facebook</span>
          <Link href="/photo-credits" className="underline">
            Photo Credits
          </Link>
        </div>
      </div>
    </footer>
  );
}
