"use client";

import { Nav } from "./Nav";
import { Footer } from "./Footer";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <div className="bg-charcoal py-2.5 text-center text-[11px] tracking-wide text-cream sm:text-xs">
        Free shipping on orders over ৳[AMOUNT] &middot; Shipped fresh from Sreemangal
      </div>
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
