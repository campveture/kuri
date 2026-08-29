"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/subscriptions", label: "Subscriptions" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/collections", label: "Collections" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/discounts", label: "Discounts" },
  { href: "/admin/journal", label: "Journal" },
  { href: "/admin/pages", label: "Pages" },
  { href: "/admin/stores", label: "Stores & stock" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminNav({ horizontal = false }: { horizontal?: boolean }) {
  const pathname = usePathname();
  return (
    <nav
      className={cn(
        horizontal
          ? "flex gap-1 overflow-x-auto border-b border-line px-3 py-2"
          : "flex flex-col gap-1 p-3",
      )}
    >
      {LINKS.map((l) => {
        const active = l.exact
          ? pathname === l.href
          : pathname === l.href || pathname.startsWith(l.href + "/");
        return (
          <Link
            key={l.href}
            href={l.href}
            data-active={active}
            className="admin-navlink whitespace-nowrap"
          >
            {l.label}
          </Link>
        );
      })}
      <Link
        href="/"
        className="admin-navlink whitespace-nowrap text-[color:rgba(247,242,230,0.6)]"
      >
        ↗ View store
      </Link>
    </nav>
  );
}
