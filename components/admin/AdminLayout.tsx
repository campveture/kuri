"use client";

import { useEffect, useState, useCallback } from "react";
import { isAuthenticated, logout, refreshSession } from "@/lib/admin-auth";
import { AdminSidebar } from "./AdminSidebar";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [currentPath, setCurrentPath] = useState("");

  const init = useCallback(() => {
    try {
      const path = window.location.pathname;
      const base = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/+$/, "");
      const cleanPath = base && path.startsWith(base) ? path.slice(base.length) || "/" : path;

      setCurrentPath(cleanPath);

      if (cleanPath === "/admin/login" || cleanPath.endsWith("/admin/login")) {
        setIsLogin(true);
        setReady(true);
        return;
      }

      if (!isAuthenticated()) {
        window.location.href = base + "/admin/login";
        return;
      }

      refreshSession();
      setReady(true);
    } catch {
      setReady(true);
    }
  }, []);

  useEffect(() => { init(); }, [init]);

  useEffect(() => {
    if (!ready || isLogin) return;
    const id = setInterval(refreshSession, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [ready, isLogin]);

  const handleLogout = () => {
    logout();
    window.location.href = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/+$/, "") + "/admin/login";
  };

  if (!ready) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fafafa" }}>
        <div style={{ width: "20px", height: "20px", border: "2px solid #e5e7eb", borderTopColor: "#4f46e5", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
      </div>
    );
  }

  if (isLogin) return <>{children}</>;

  return (
    <div className="admin-body">
      <AdminSidebar onLogout={handleLogout} currentPath={currentPath} />
      <main className="admin-main">{children}</main>
    </div>
  );
}
