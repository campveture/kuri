export const SITE = {
  name: "Kuri",
  tagline: "One garden, one team, no blending",
  description:
    "Kuri Valley Estate grows single-origin tea in the hills of Sreemangal, Bangladesh. Orthodox black, pan-fired green, hand-rolled oolong — picked and processed on the estate.",
  // Bracketed values are placeholders — replace before launch (search the repo for "[").
  phone: "[PHONE]",
  phoneIntl: "[PHONE_INTL]",
  whatsapp: "[WHATSAPP]",
  email: "[EMAIL]",
  instagram: "[INSTAGRAM_HANDLE]",
  instagramUrl: "[INSTAGRAM_URL]",
  facebookUrl: "[FACEBOOK_URL]",
  address: "Kuri Valley Estate, Sreemangal, Moulvibazar, Bangladesh",
} as const;

/** Fallback shipping config — overridden by the Settings table when present. */
export const SHIPPING_DEFAULTS = {
  insideDhaka: 60,
  outsideDhaka: 120,
  freeShippingThreshold: 3000,
};

/** Tea weights sold online — the `size` on a ProductVariant. */
export const WEIGHTS = ["50g", "100g", "250g"] as const;

/** Price filter bands for the shop page. `key` is the "min-max" query value. */
export const PRICE_BANDS = [
  { key: "0-400", label: "Under ৳400" },
  { key: "400-550", label: "৳400 – ৳550" },
  { key: "550-700", label: "৳550 – ৳700" },
  { key: "700-", label: "৳700 & up" },
] as const;
