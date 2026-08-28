// Admin data management layer.
// All data is stored in localStorage since this is a static export.
// Products and journal posts can be created/edited/deleted from the admin panel.

import type { Product } from "./commerce";

export type SiteSettings = {
  siteName: string;
  tagline: string;
  email: string;
  phone: string;
  address: string;
  shippingMessage: string;
  socialLinks: {
    instagram: string;
    facebook: string;
    twitter: string;
  };
  heroTitle: string;
  heroSubtitle: string;
  heroCTA: string;
};

export type JournalPost = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  date: string;
  author: string;
  category: string;
  image: string;
};

export type AdminData = {
  products: Product[];
  journalPosts: JournalPost[];
  settings: SiteSettings;
};

const ADMIN_DATA_KEY = "kuri_admin_data";

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "Kuri Valley Estate",
  tagline: "Single-origin tea from Sreemangal, Bangladesh",
  email: "[EMAIL]",
  phone: "[PHONE]",
  address: "Sreemangal, Sylhet, Bangladesh",
  shippingMessage: "Free shipping on orders over [AMOUNT] &middot; Shipped fresh from Sreemangal",
  socialLinks: {
    instagram: "",
    facebook: "",
    twitter: "",
  },
  heroTitle: "Tea from one valley",
  heroSubtitle: "Kuri Valley Estate sits in the hills of Sylhet's tea country.",
  heroCTA: "Shop Our Teas",
};

function getStoredData(): AdminData | null {
  try {
    const raw = localStorage.getItem(ADMIN_DATA_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function storeData(data: AdminData): void {
  localStorage.setItem(ADMIN_DATA_KEY, JSON.stringify(data));
}

export function getSettings(): SiteSettings {
  const data = getStoredData();
  return data?.settings ?? DEFAULT_SETTINGS;
}

export function updateSettings(settings: SiteSettings): void {
  const data = getStoredData() ?? { products: [], journalPosts: [], settings: DEFAULT_SETTINGS };
  data.settings = settings;
  storeData(data);
}

export function getProducts(): Product[] {
  const data = getStoredData();
  return data?.products ?? [];
}

export function addProduct(product: Product): void {
  const data = getStoredData() ?? { products: [], journalPosts: [], settings: DEFAULT_SETTINGS };
  data.products.push(product);
  storeData(data);
}

export function updateProduct(handle: string, updates: Partial<Product>): void {
  const data = getStoredData();
  if (!data) return;
  const idx = data.products.findIndex((p) => p.handle === handle);
  if (idx !== -1) {
    data.products[idx] = { ...data.products[idx], ...updates };
    storeData(data);
  }
}

export function deleteProduct(handle: string): void {
  const data = getStoredData();
  if (!data) return;
  data.products = data.products.filter((p) => p.handle !== handle);
  storeData(data);
}

export function getJournalPosts(): JournalPost[] {
  const data = getStoredData();
  return data?.journalPosts ?? [];
}

export function addJournalPost(post: JournalPost): void {
  const data = getStoredData() ?? { products: [], journalPosts: [], settings: DEFAULT_SETTINGS };
  data.journalPosts.push(post);
  storeData(data);
}

export function updateJournalPost(slug: string, updates: Partial<JournalPost>): void {
  const data = getStoredData();
  if (!data) return;
  const idx = data.journalPosts.findIndex((p) => p.slug === slug);
  if (idx !== -1) {
    data.journalPosts[idx] = { ...data.journalPosts[idx], ...updates };
    storeData(data);
  }
}

export function deleteJournalPost(slug: string): void {
  const data = getStoredData();
  if (!data) return;
  data.journalPosts = data.journalPosts.filter((p) => p.slug !== slug);
  storeData(data);
}

export function getDashboardStats(): {
  totalProducts: number;
  totalJournalPosts: number;
  recentActivity: number;
} {
  const data = getStoredData();
  return {
    totalProducts: data?.products.length ?? 0,
    totalJournalPosts: data?.journalPosts.length ?? 0,
    recentActivity: 0,
  };
}

export function exportData(): string {
  const data = getStoredData() ?? { products: [], journalPosts: [], settings: DEFAULT_SETTINGS };
  return JSON.stringify(data, null, 2);
}

export function importData(json: string): boolean {
  try {
    const data: AdminData = JSON.parse(json);
    if (!data.settings || !Array.isArray(data.products) || !Array.isArray(data.journalPosts)) {
      return false;
    }
    storeData(data);
    return true;
  } catch {
    return false;
  }
}

export function resetData(): void {
  localStorage.removeItem(ADMIN_DATA_KEY);
}