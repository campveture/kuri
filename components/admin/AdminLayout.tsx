"use client";

import { useEffect, useState } from "react";
import { isLoggedIn, logout } from "@/lib/admin-auth";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { href: "/admin/products", label: "Products", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
  { href: "/admin/journal", label: "Journal", icon: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" },
  { href: "/admin/settings", label: "Settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState(false);
  const pathname = usePathname();
  const base = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/+$/, "");
  const clean = base && pathname.startsWith(base) ? pathname.slice(base.length) || "/" : pathname;
  const isLogin = clean === "/admin/login" || clean.endsWith("/admin/login");

  useEffect(() => {
    if (isLogin) { setOk(true); return; }
    if (!isLoggedIn()) { window.location.href = base + "/admin/login"; return; }
    setOk(true);
  }, [isLogin, base]);

  if (!ok) {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fafafa" }}>
      <div style={{ width: "20px", height: "20px", border: "2px solid #e5e7eb", borderTopColor: "#4f46e5", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
    </div>;
  }

  if (isLogin) return <>{children}</>;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#fafafa" }}>
      <aside style={{ width: "220px", background: "#fff", borderRight: "1px solid #e5e7eb", display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 40 }}>
        <div style={{ padding: "20px 16px", borderBottom: "1px solid #f3f4f6" }}>
          <Link href="/admin" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#4f46e5", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "14px" }}>K</div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>Kuri</div>
              <div style={{ fontSize: "11px", color: "#9ca3af" }}>Admin</div>
            </div>
          </Link>
        </div>
        <nav style={{ flex: 1, padding: "8px" }}>
          {NAV.map((item) => {
            const active = clean === item.href || (item.href !== "/admin" && clean.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", borderRadius: "6px", fontSize: "14px", fontWeight: 500, color: active ? "#4f46e5" : "#6b7280", background: active ? "#eef2ff" : "transparent", textDecoration: "none", marginBottom: "2px" }}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ width: "18px", height: "18px", opacity: active ? 1 : 0.6 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div style={{ padding: "8px", borderTop: "1px solid #f3f4f6" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", borderRadius: "6px", fontSize: "14px", fontWeight: 500, color: "#6b7280", textDecoration: "none" }}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ width: "18px", height: "18px", opacity: 0.6 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View Site
          </Link>
          <button onClick={() => { logout(); window.location.href = base + "/admin/login"; }} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", borderRadius: "6px", fontSize: "14px", fontWeight: 500, color: "#6b7280", background: "none", border: "none", cursor: "pointer", width: "100%", textAlign: "left" }}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ width: "18px", height: "18px", opacity: 0.6 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Log out
          </button>
        </div>
      </aside>
      <main style={{ marginLeft: "220px", flex: 1, padding: "32px", minHeight: "100vh" }}>{children}</main>
    </div>
  );
}
