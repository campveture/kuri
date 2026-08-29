"use client";

import { Nav } from "./Nav";
import { Footer } from "./Footer";

export function SiteChrome({
  children,
  announcement,
}: {
  children: React.ReactNode;
  announcement?: string;
}) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <div className="fixed top-0 left-0 right-0 z-40">
        {announcement ? (
          <div className="bg-charcoal py-2.5 text-center text-[11px] tracking-wide text-cream sm:text-xs">
            {announcement}
          </div>
        ) : null}
        <Nav />
      </div>
      <div className="h-[calc(40px+60px)] md:h-[calc(40px+72px)]" />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
