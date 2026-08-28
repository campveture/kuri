"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { AccountIcon, BagIcon, ChevronDownIcon, MenuIcon, SearchIcon } from "@/components/Icons";
import { SearchOverlay } from "@/components/SearchOverlay";
import { MobileMenu } from "@/components/MobileMenu";

// There's no real account/auth backend yet, so the account icon stays
// decorative rather than pointing at a fake login page.
export function Nav() {
  const { totalCount, openCart } = useCart();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="sticky top-0 z-20 bg-cream border-b border-line">
      <div className="wrap flex items-center justify-between h-[72px] md:h-[84px]">
        <div className="flex items-center gap-11">
          <button
            type="button"
            aria-label="Open menu"
            className="text-charcoal md:hidden"
            onClick={() => setMenuOpen(true)}
          >
            <MenuIcon />
          </button>
          <Link href="/" className="font-serif text-xl font-semibold tracking-[0.14em] md:text-2xl">
            KURI
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/shop" className="flex items-center gap-1 nav-link link-sweep">
              <span>Shop</span>
              <ChevronDownIcon />
            </Link>
            <Link href="/our-origin" className="nav-link link-sweep">
              Our Origin
            </Link>
            <Link href="/our-story" className="nav-link link-sweep">
              Our Story
            </Link>
            <Link href="/subscriptions" className="nav-link link-sweep">
              Subscriptions
            </Link>
            <Link href="/journal" className="nav-link link-sweep">
              Journal
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4 md:gap-5">
          <button
            type="button"
            aria-label="Search"
            className="text-charcoal"
            onClick={() => setSearchOpen(true)}
          >
            <SearchIcon />
          </button>
          <Link
            href="/admin"
            className="hidden text-charcoal md:block"
            title="Admin Panel"
          >
            <AccountIcon />
          </Link>
          <button
            type="button"
            aria-label="Open cart"
            onClick={openCart}
            className="relative text-charcoal"
          >
            <BagIcon />
            {totalCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-charcoal px-1 text-[10px] font-semibold text-cream">
                {totalCount}
              </span>
            )}
          </button>
        </div>
      </div>
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}
