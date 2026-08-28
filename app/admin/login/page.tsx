"use client";

import { useState, useEffect } from "react";
import { login, isLoggedIn } from "@/lib/admin-auth";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const base = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/+$/, "");

  useEffect(() => {
    if (isLoggedIn()) window.location.href = base + "/admin/";
  }, [base]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(username, password)) {
      window.location.href = base + "/admin/";
    } else {
      setError("Invalid credentials.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fafafa", fontFamily: "system-ui, sans-serif", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: "360px" }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#4f46e5", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "16px", marginBottom: "12px" }}>K</div>
          <h1 style={{ fontSize: "18px", fontWeight: 600, color: "#111827", margin: 0 }}>Kuri Admin</h1>
        </div>
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "24px" }}>
          <form onSubmit={handleSubmit}>
            {error && <div style={{ marginBottom: "12px", padding: "8px 12px", borderRadius: "6px", background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: "13px" }}>{error}</div>}
            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "4px" }}>Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #e5e7eb", fontSize: "14px", boxSizing: "border-box" as const }} />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "4px" }}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #e5e7eb", fontSize: "14px", boxSizing: "border-box" as const }} />
            </div>
            <button type="submit" style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "none", background: "#4f46e5", color: "#fff", fontSize: "14px", fontWeight: 500, cursor: "pointer" }}>Sign in</button>
          </form>
        </div>
      </div>
    </div>
  );
}
