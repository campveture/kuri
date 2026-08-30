"use client";

import Link from "next/link";
import { CloseIcon } from "@/components/Icons";
import { useOverlay } from "@/components/useOverlay";

const links = [
  { href: "/shop", label: "Shop" },
  { href: "/our-origin", label: "Our Origin" },
  { href: "/our-story", label: "Our Story" },
  { href: "/subscriptions", label: "Subscriptions" },
  { href: "/journal", label: "Journal" },
  { href: "/contact", label: "Contact" },
  { href: "/account", label: "Account" },
];

export function MobileMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  useOverlay(isOpen, onClose);
  return (
    <>
      {/* Backdrop */}
      <div
        className={`mobile-menu-backdrop ${isOpen ? "mobile-menu-backdrop--open" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={`mobile-menu-panel ${isOpen ? "mobile-menu-panel--open" : ""}`}
        inert={!isOpen}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <span className="font-serif text-xl font-semibold tracking-[0.14em]">KURI</span>
          <button type="button" onClick={onClose} aria-label="Close menu" className="nav-icon-btn">
            <CloseIcon size={20} />
          </button>
        </div>
        <nav className="flex flex-1 flex-col px-6 py-6">
          {links.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="mobile-menu-link"
              style={{ transitionDelay: isOpen ? `${80 + i * 50}ms` : "0ms" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
