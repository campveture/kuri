import { prisma } from "@/lib/prisma";
import { SITE, SHIPPING_DEFAULTS } from "@/lib/site";

export type StoreSettings = {
  bkashNumber: string;
  bkashType: string;
  nagadNumber: string;
  nagadType: string;
  shippingInsideDhaka: number;
  shippingOutsideDhaka: number;
  freeShippingThreshold: number;
  announcement: string;
  // storefront
  heroHeadline: string;
  heroSubtext: string;
  heroCtaLabel: string;
  heroCtaHref: string;
  heroSecondaryLabel: string;
  heroSecondaryHref: string;
  featuredCollection: string; // collection slug, or ""
  footerBlurb: string;
  showNewArrivals: boolean;
  heroImages: string[]; // hero photo strip on the default homepage
};

/** Keys the admin can write via the settings form. */
export const SETTING_KEYS = [
  "bkash_number",
  "bkash_type",
  "nagad_number",
  "nagad_type",
  "shipping_inside_dhaka",
  "shipping_outside_dhaka",
  "free_shipping_threshold",
  "announcement",
  "hero_headline",
  "hero_subtext",
  "hero_cta_label",
  "hero_cta_href",
  "hero_secondary_label",
  "hero_secondary_href",
  "featured_collection",
  "footer_blurb",
  "show_new_arrivals",
  "hero_images",
] as const;

export const STOREFRONT_DEFAULTS = {
  heroHeadline: "One garden.\nOne team.\nNo blending.",
  heroSubtext:
    "Orthodox black, pan-fired green and hand-rolled oolong — grown, picked and processed on Kuri Valley Estate in the hills of Sreemangal.",
  heroCtaLabel: "Shop the teas",
  heroCtaHref: "/shop",
  heroSecondaryLabel: "Our origin",
  heroSecondaryHref: "/our-origin",
};

export async function getSettings(): Promise<StoreSettings> {
  const rows = await prisma.setting.findMany({
    where: { key: { in: SETTING_KEYS as unknown as string[] } },
  });
  const map = new Map(rows.map((r) => [r.key, r.value]));
  const str = (k: string, d = "") => {
    const raw = map.get(k);
    return raw != null && raw.trim() !== "" ? raw : d;
  };
  const num = (k: string, d: number) => {
    const raw = map.get(k);
    if (raw == null || raw.trim() === "") return d;
    const v = Number(raw);
    return Number.isFinite(v) && v >= 0 ? v : d;
  };
  return {
    bkashNumber: str("bkash_number", SITE.phone),
    bkashType: str("bkash_type", "Personal"),
    nagadNumber: str("nagad_number", SITE.phone),
    nagadType: str("nagad_type", "Personal"),
    shippingInsideDhaka: num("shipping_inside_dhaka", SHIPPING_DEFAULTS.insideDhaka),
    shippingOutsideDhaka: num(
      "shipping_outside_dhaka",
      SHIPPING_DEFAULTS.outsideDhaka,
    ),
    freeShippingThreshold: num(
      "free_shipping_threshold",
      SHIPPING_DEFAULTS.freeShippingThreshold,
    ),
    announcement: str("announcement"),
    heroHeadline: str("hero_headline", STOREFRONT_DEFAULTS.heroHeadline),
    heroSubtext: str("hero_subtext", STOREFRONT_DEFAULTS.heroSubtext),
    heroCtaLabel: str("hero_cta_label", STOREFRONT_DEFAULTS.heroCtaLabel),
    heroCtaHref: str("hero_cta_href", STOREFRONT_DEFAULTS.heroCtaHref),
    heroSecondaryLabel: str(
      "hero_secondary_label",
      STOREFRONT_DEFAULTS.heroSecondaryLabel,
    ),
    heroSecondaryHref: str(
      "hero_secondary_href",
      STOREFRONT_DEFAULTS.heroSecondaryHref,
    ),
    featuredCollection: str("featured_collection"),
    footerBlurb: str("footer_blurb"),
    showNewArrivals: str("show_new_arrivals", "true") !== "false",
    heroImages: parseJsonArray(map.get("hero_images")),
  };
}

function parseJsonArray(raw: string | undefined): string[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.filter((s) => typeof s === "string" && s) : [];
  } catch {
    return [];
  }
}

export function calcShipping(
  subtotal: number,
  city: string,
  settings: StoreSettings,
) {
  if (subtotal >= settings.freeShippingThreshold) return 0;
  const inside = city.trim().toLowerCase() === "dhaka";
  return inside ? settings.shippingInsideDhaka : settings.shippingOutsideDhaka;
}

export async function setSettings(updates: Record<string, string>) {
  await prisma.$transaction(
    Object.entries(updates).map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      }),
    ),
  );
}
