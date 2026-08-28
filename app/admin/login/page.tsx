"use client";

import { useState, useEffect } from "react";

const CREDENTIALS = { username: "admin", password: "KuriAdmin@2024" };
const SESSION_KEY = "kuri_admin_session";
const ATTEMPTS_KEY = "kuri_admin_attempts";
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;
const SESSION_MS = 2 * 60 * 60 * 1000;

function getAttempts() {
  try {
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    if (!raw) return { count: 0, lockedUntil: 0 };
    const d = JSON.parse(raw);
    if (Date.now() > d.lockedUntil) return { count: 0, lockedUntil: 0 };
    return d;
  } catch { return { count: 0, lockedUntil: 0 }; }
}

function recordAttempt() {
  const a = getAttempts();
  const c = a.count + 1;
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify({ count: c, lockedUntil: c >= MAX_ATTEMPTS ? Date.now() + LOCKOUT_MS : a.lockedUntil }));
}

function resetAttempts() { localStorage.removeItem(ATTEMPTS_KEY); }

function isLoggedIn() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return false;
    return Date.now() < JSON.parse(raw).expiresAt;
  } catch { return false; }
}

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn()) window.location.href = (process.env.NEXT_PUBLIC_BASE_PATH || "") + "/admin/";
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const attempts = getAttempts();
    if (attempts.lockedUntil > Date.now()) {
      const min = Math.ceil((attempts.lockedUntil - Date.now()) / 60000);
      setError(`Too many attempts. Try again in ${min} minutes.`);
      setLoading(false);
      return;
    }

    if (username !== CREDENTIALS.username || password !== CREDENTIALS.password) {
      recordAttempt();
      const left = MAX_ATTEMPTS - getAttempts().count;
      setError(left <= 0 ? "Locked out for 15 minutes." : `Invalid credentials. ${left} attempts remaining.`);
      setLoading(false);
      return;
    }

    resetAttempts();
    localStorage.setItem(SESSION_KEY, JSON.stringify({ username, expiresAt: Date.now() + SESSION_MS }));
    window.location.href = (process.env.NEXT_PUBLIC_BASE_PATH || "") + "/admin/";
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#fafafa",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      padding: "24px",
    }}>
      <div style={{ width: "100%", maxWidth: "380px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "10px",
            background: "#4f46e5", color: "white", display: "inline-flex",
            alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "16px",
            marginBottom: "16px",
          }}>K</div>
          <h1 style={{ fontSize: "20px", fontWeight: 600, color: "#111827", margin: 0 }}>Kuri Admin</h1>
          <p style={{ fontSize: "14px", color: "#6b7280", margin: "4px 0 0" }}>Sign in to manage your website</p>
        </div>

        <div style={{
          background: "white", border: "1px solid #e5e7eb", borderRadius: "12px",
          padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}>
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{
                marginBottom: "16px", padding: "10px 14px", borderRadius: "8px",
                background: "#fef2f2", border: "1px solid #fecaca",
                color: "#dc2626", fontSize: "13px",
              }}>{error}</div>
            )}

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "6px" }}>
                Username
              </label>
              <input
                type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                required autoFocus
                style={{
                  width: "100%", padding: "8px 12px", borderRadius: "6px",
                  border: "1px solid #e5e7eb", fontSize: "14px", color: "#111827",
                  outline: "none", boxSizing: "border-box" as const,
                }}
                placeholder="Enter username"
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "6px" }}>
                Password
              </label>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: "100%", padding: "8px 12px", borderRadius: "6px",
                  border: "1px solid #e5e7eb", fontSize: "14px", color: "#111827",
                  outline: "none", boxSizing: "border-box" as const,
                }}
                placeholder="Enter password"
              />
            </div>

            <button
              type="submit" disabled={loading}
              style={{
                width: "100%", padding: "9px 16px", borderRadius: "6px",
                border: "none", background: loading ? "#818cf8" : "#4f46e5",
                color: "white", fontSize: "14px", fontWeight: 500,
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background 0.15s",
              }}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "12px", color: "#9ca3af" }}>
          Protected area. Unauthorized access is logged.
        </p>
      </div>
    </div>
  );
}
