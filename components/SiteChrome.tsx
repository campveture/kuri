"use client";

import { usePathname } from "next/navigation";
import { Nav } from "./Nav";
import { Footer } from "./Footer";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) return <>{children}</>;

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <div className="bg-charcoal py-2.5 text-center text-xs tracking-wide text-cream">
        Free shipping on orders over ৳[AMOUNT] &middot; Shipped fresh from Sreemangal
      </div>
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
