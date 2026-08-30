"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { AccountIcon, BagIcon, MenuIcon, SearchIcon } from "@/components/Icons";
import { SearchOverlay } from "@/components/SearchOverlay";
import { MobileMenu } from "@/components/MobileMenu";

export function Nav() {
  const { totalCount, openCart, ready } = useCart();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const ticking = useRef(false);

  const onScroll = useCallback(() => {
    if (!ticking.current) {
      requestAnimationFrame(() => {
        document.documentElement.classList.toggle("nav-scrolled", window.scrollY > 50);
        ticking.current = false;
      });
      ticking.current = true;
    }
  }, []);

  useEffect(() => {
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  return (
    <nav className="nav-bar">
      <div className="wrap flex items-center justify-between h-[60px] md:h-[72px]">
        <div className="flex items-center gap-8 md:gap-10">
          <button type="button" aria-label="Open menu" className="nav-icon-btn md:hidden" onClick={() => setMenuOpen(true)}>
            <MenuIcon size={20} />
          </button>
          <Link href="/" className="font-serif text-lg font-semibold tracking-[0.14em] transition-colors duration-300 hover:text-gold-deep md:text-xl">
            KURI
          </Link>
          <div className="hidden items-center gap-6 md:flex lg:gap-7">
            <Link href="/shop" className="nav-link-wrap"><span>Shop</span></Link>
            <Link href="/our-origin" className="nav-link-wrap"><span>Our Origin</span></Link>
            <Link href="/our-story" className="nav-link-wrap"><span>Our Story</span></Link>
            <Link href="/subscriptions" className="nav-link-wrap"><span>Subscriptions</span></Link>
            <Link href="/journal" className="nav-link-wrap"><span>Journal</span></Link>
            <Link href="/contact" className="nav-link-wrap"><span>Contact</span></Link>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <button type="button" aria-label="Search" className="nav-icon-btn" onClick={() => setSearchOpen(true)}>
            <SearchIcon size={18} />
          </button>
          <Link href="/account" aria-label="Account" className="nav-icon-btn">
            <AccountIcon size={18} />
          </Link>
          <button type="button" aria-label="Open cart" onClick={openCart} className="nav-icon-btn relative">
            <BagIcon size={18} />
            {ready && totalCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-charcoal px-1 text-[10px] font-semibold text-cream">
                {totalCount}
              </span>
            )}
          </button>
        </div>
      </div>
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </nav>
  );
}
