// Client-side admin authentication system.
// Since this is a static export, all auth is client-side with localStorage.

const ADMIN_SESSION_KEY = "kuri_admin_session";
const ADMIN_ATTEMPTS_KEY = "kuri_admin_attempts";
const SESSION_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// Default admin credentials (hashed with SHA-256)
// Username: admin, Password: KuriAdmin@2024
// In production, these should be rotated and ideally use a real backend.
const ADMIN_USERNAME_HASH = "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918";
const ADMIN_PASSWORD_HASH = "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8";

type Session = {
  username: string;
  token: string;
  expiresAt: number;
  createdAt: number;
};

function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  return crypto.subtle.digest("SHA-256", msgBuffer).then((hashBuffer) => {
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  });
}

function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

function getAttempts(): { count: number; lockedUntil: number } {
  try {
    const raw = localStorage.getItem(ADMIN_ATTEMPTS_KEY);
    if (!raw) return { count: 0, lockedUntil: 0 };
    const data = JSON.parse(raw);
    if (Date.now() > data.lockedUntil) return { count: 0, lockedUntil: 0 };
    return data;
  } catch {
    return { count: 0, lockedUntil: 0 };
  }
}

function recordAttempt(): void {
  const attempts = getAttempts();
  const newCount = attempts.count + 1;
  const lockedUntil = newCount >= MAX_LOGIN_ATTEMPTS ? Date.now() + LOCKOUT_DURATION_MS : attempts.lockedUntil;
  localStorage.setItem(ADMIN_ATTEMPTS_KEY, JSON.stringify({ count: newCount, lockedUntil }));
}

function resetAttempts(): void {
  localStorage.removeItem(ADMIN_ATTEMPTS_KEY);
}

export async function login(username: string, password: string): Promise<{ ok: boolean; error?: string }> {
  const attempts = getAttempts();
  if (attempts.lockedUntil > Date.now()) {
    const remaining = Math.ceil((attempts.lockedUntil - Date.now()) / 60000);
    return { ok: false, error: `Too many attempts. Try again in ${remaining} minutes.` };
  }

  const usernameHash = await sha256(username);
  const passwordHash = await sha256(password);

  if (usernameHash !== ADMIN_USERNAME_HASH || passwordHash !== ADMIN_PASSWORD_HASH) {
    recordAttempt();
    const remaining = MAX_LOGIN_ATTEMPTS - getAttempts().count;
    if (remaining <= 0) {
      return { ok: false, error: `Locked out for 15 minutes after ${MAX_LOGIN_ATTEMPTS} failed attempts.` };
    }
    return { ok: false, error: `Invalid credentials. ${remaining} attempts remaining.` };
  }

  resetAttempts();

  const session: Session = {
    username,
    token: generateToken(),
    expiresAt: Date.now() + SESSION_DURATION_MS,
    createdAt: Date.now(),
  };

  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
  logActivity("login", `Admin "${username}" logged in`);
  return { ok: true };
}

export function logout(): void {
  const session = getSession();
  if (session) {
    logActivity("logout", `Admin "${session.username}" logged out`);
  }
  localStorage.removeItem(ADMIN_SESSION_KEY);
}

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;
    const session: Session = JSON.parse(raw);
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(ADMIN_SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getSession() !== null;
}

export function refreshSession(): void {
  const session = getSession();
  if (session) {
    session.expiresAt = Date.now() + SESSION_DURATION_MS;
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
  }
}

// ---------- Activity Log ----------

export type ActivityEntry = {
  id: string;
  timestamp: number;
  action: string;
  detail: string;
};

const ACTIVITY_KEY = "kuri_admin_activity";

function logActivity(action: string, detail: string): void {
  const entries = getActivityLog();
  const entry: ActivityEntry = {
    id: generateToken().slice(0, 16),
    timestamp: Date.now(),
    action,
    detail,
  };
  entries.unshift(entry);
  // Keep last 200 entries
  if (entries.length > 200) entries.length = 200;
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(entries));
}

export function getActivityLog(): ActivityEntry[] {
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearActivityLog(): void {
  localStorage.removeItem(ACTIVITY_KEY);
}

// ---------- CSRF Token ----------

const CSRF_KEY = "kuri_admin_csrf";

export function getCsrfToken(): string {
  let token = sessionStorage.getItem(CSRF_KEY);
  if (!token) {
    token = generateToken();
    sessionStorage.setItem(CSRF_KEY, token);
  }
  return token;
}

export function validateCsrfToken(token: string): boolean {
  return token === sessionStorage.getItem(CSRF_KEY);
}

// ---------- Input Sanitization ----------

export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .trim();
}

export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result = { ...obj };
  for (const key of Object.keys(result)) {
    if (typeof result[key] === "string") {
      (result as Record<string, unknown>)[key] = sanitizeInput(result[key] as string);
    }
  }
  return result;
}

// ---------- Export for activity logging from other modules ----------

export { logActivity };
