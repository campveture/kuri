"use client";

import Link from "next/link";
import { CloseIcon } from "@/components/Icons";

const links = [
  { href: "/shop", label: "Shop" },
  { href: "/our-origin", label: "Our Origin" },
  { href: "/our-story", label: "Our Story" },
  { href: "/subscriptions", label: "Subscriptions" },
  { href: "/journal", label: "Journal" },
  { href: "/contact", label: "Contact" },
];

export function MobileMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-cream md:hidden">
      <div className="wrap flex items-center justify-between border-b border-line py-6">
        <span className="font-serif text-2xl font-semibold tracking-[0.14em]">KURI</span>
        <button type="button" onClick={onClose} aria-label="Close menu">
          <CloseIcon size={22} />
        </button>
      </div>
      <nav className="wrap flex flex-1 flex-col gap-1 py-8">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className="border-b border-line py-4 font-serif text-2xl"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
