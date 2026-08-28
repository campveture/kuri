"use client";

import { Nav } from "./Nav";
import { Footer } from "./Footer";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      {/* Fixed header: announcement + nav */}
      <div className="fixed top-0 left-0 right-0 z-40">
        <div className="bg-charcoal py-2.5 text-center text-[11px] tracking-wide text-cream sm:text-xs">
          Free shipping on orders over ৳[AMOUNT] &middot; Shipped fresh from Sreemangal
        </div>
        <Nav />
      </div>
      {/* Spacer for fixed header */}
      <div className="h-[calc(40px+60px)] md:h-[calc(40px+72px)]" />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
