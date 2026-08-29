import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

const taka = new Intl.NumberFormat("en-BD", { maximumFractionDigits: 0 });

/** Format a whole-taka integer as "৳ 1,290" */
export function formatBDT(amount: number) {
  return `৳ ${taka.format(Math.round(amount || 0))}`;
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Cryptographically-random string from an unambiguous alphabet. */
export function randomToken(length = 8, alphabet = "abcdefghijkmnpqrstuvwxyz23456789") {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < length; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

/** KV-26-K7M2QP4H style order number — ~30^8 keyspace, not enumerable. */
export function generateOrderNumber() {
  const y = new Date().getFullYear().toString().slice(-2);
  return `KV-${y}-${randomToken(8, "ABCDEFGHJKMNPQRSTUVWXYZ23456789")}`;
}

/** Unique-ish SKU for a variant. */
export function generateSku(size: string) {
  return `KV-${randomToken(6).toUpperCase()}-${size.toUpperCase()}`;
}

/** POS-26-K7M2QP4H — counter-sale receipt number, same keyspace as orders. */
export function generateSaleNumber() {
  const y = new Date().getFullYear().toString().slice(-2);
  return `POS-${y}-${randomToken(8, "ABCDEFGHJKMNPQRSTUVWXYZ23456789")}`;
}

export function parseImages(json: string): string[] {
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === "string") : [];
  } catch {
    return [];
  }
}

/** Safe read of a JSON string-array column (tastingNotes, journal body, ...). */
export function parseStringArray(json: string | null | undefined): string[] {
  if (!json) return [];
  return parseImages(json);
}

export function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(d: Date | string) {
  return new Date(d).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Sort tea weights ("50g" < "100g" < "250g"); non-numeric falls back to string order. */
export function compareWeights(a: string, b: string) {
  const na = parseFloat(a);
  const nb = parseFloat(b);
  if (Number.isFinite(na) && Number.isFinite(nb)) return na - nb;
  return a.localeCompare(b);
}

export const ORDER_STATUS_FLOW = [
  "PENDING",
  "CONFIRMED",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
] as const;
