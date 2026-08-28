// Single auth module for admin panel.
// Static export = all auth is client-side via localStorage.

const SESSION_KEY = "kuri_session";

export function login(username: string, password: string): boolean {
  if (username === "admin" && password === "KuriAdmin@2024") {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ u: username, e: Date.now() + 7200000 }));
    return true;
  }
  return false;
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function isLoggedIn(): boolean {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return false;
    const s = JSON.parse(raw);
    if (Date.now() > s.e) { localStorage.removeItem(SESSION_KEY); return false; }
    return true;
  } catch { return false; }
}
