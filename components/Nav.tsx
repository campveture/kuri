"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { BagIcon, ChevronDownIcon, MenuIcon, SearchIcon } from "@/components/Icons";
import { SearchOverlay } from "@/components/SearchOverlay";
import { MobileMenu } from "@/components/MobileMenu";

export function Nav() {
  const { totalCount, openCart } = useCart();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const onScroll = useCallback(() => {
    setScrolled(window.scrollY > 60);
  }, []);

  useEffect(() => {
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  return (
    <>
      <nav
        className={`nav-bar fixed top-0 left-0 right-0 z-30 transition-all duration-500 ease-out ${
          scrolled
            ? "nav-bar--scrolled"
            : "nav-bar--top"
        }`}
      >
        <div className="wrap flex items-center justify-between h-[60px] md:h-[72px]">
          {/* Left: hamburger + logo */}
          <div className="flex items-center gap-8 md:gap-10">
            <button
              type="button"
              aria-label="Open menu"
              className="nav-icon-btn md:hidden"
              onClick={() => setMenuOpen(true)}
            >
              <MenuIcon size={20} />
            </button>
            <Link href="/" className="font-serif text-lg font-semibold tracking-[0.14em] transition-colors duration-300 hover:text-gold-deep md:text-xl">
              KURI
            </Link>
            {/* Desktop nav links */}
            <div className="hidden items-center gap-7 md:flex lg:gap-8">
              <Link href="/shop" className="nav-link-wrap">
                <span className="nav-link-text">Shop</span>
                <ChevronDownIcon size={9} />
              </Link>
              <Link href="/our-origin" className="nav-link-wrap">
                <span className="nav-link-text">Our Origin</span>
              </Link>
              <Link href="/our-story" className="nav-link-wrap">
                <span className="nav-link-text">Our Story</span>
              </Link>
              <Link href="/subscriptions" className="nav-link-wrap">
                <span className="nav-link-text">Subscriptions</span>
              </Link>
              <Link href="/journal" className="nav-link-wrap">
                <span className="nav-link-text">Journal</span>
              </Link>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              aria-label="Search"
              className="nav-icon-btn"
              onClick={() => setSearchOpen(true)}
            >
              <SearchIcon size={18} />
            </button>
            <button
              type="button"
              aria-label="Open cart"
              onClick={openCart}
              className="nav-icon-btn relative"
            >
              <BagIcon size={18} />
              {totalCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-charcoal px-1 text-[10px] font-semibold text-cream">
                  {totalCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Spacer to offset fixed nav */}
      <div className="h-[60px] md:h-[72px]" />

      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
