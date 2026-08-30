/* ---------------------------------------------------------------------------
 * Landing-page block system.
 *
 * A page's layout is a JSON array of blocks: [{ id, type, ...props }].
 * This file is the single source of truth for:
 *   - the block prop shapes (types)
 *   - each block's editable fields (BLOCK_META — drives the admin builder)
 *   - default props for a freshly-added block
 *   - safe parsing of stored JSON (parseBlocks — never throws)
 *
 * No React, no server imports — shared by the builder (client) and the
 * renderer (server).
 * ------------------------------------------------------------------------- */

export type BlockType =
  | "hero"
  | "marquee"
  | "productGrid"
  | "collections"
  | "banner"
  | "story"
  | "richText";

type Base = { id: string; type: BlockType };

export type HeroBlock = Base & {
  type: "hero";
  eyebrow: string;
  headline: string;
  subtext: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  images: string[];
  align: "left" | "center";
};

export type MarqueeBlock = Base & {
  type: "marquee";
  text: string;
};

export type ProductGridBlock = Base & {
  type: "productGrid";
  heading: string;
  subheading: string;
  source: "featured" | "new" | "collection";
  collectionSlug: string;
  limit: number;
};

export type CollectionsBlock = Base & {
  type: "collections";
  heading: string;
};

export type BannerBlock = Base & {
  type: "banner";
  heading: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  image: string;
  tone: "gold" | "dark";
};

export type StoryBlock = Base & {
  type: "story";
  heading: string;
  body: string;
  image: string;
  imageSide: "left" | "right";
};

export type RichTextBlock = Base & {
  type: "richText";
  heading: string;
  body: string;
  align: "left" | "center";
};

export type Block =
  | HeroBlock
  | MarqueeBlock
  | ProductGridBlock
  | CollectionsBlock
  | BannerBlock
  | StoryBlock
  | RichTextBlock;

/* ----------------------------- field schema ----------------------------- */

export type FieldKind =
  | "text"
  | "textarea"
  | "number"
  | "image"
  | "images"
  | "collection"
  | { select: { value: string; label: string }[] };

export type Field = { name: string; label: string; kind: FieldKind };

export const BLOCK_META: Record<
  BlockType,
  { label: string; hint: string; fields: Field[] }
> = {
  hero: {
    label: "Hero",
    hint: "Big headline, buttons and image panel.",
    fields: [
      { name: "eyebrow", label: "Eyebrow", kind: "text" },
      { name: "headline", label: "Headline (line breaks allowed)", kind: "textarea" },
      { name: "subtext", label: "Subtext", kind: "textarea" },
      { name: "primaryLabel", label: "Primary button", kind: "text" },
      { name: "primaryHref", label: "Primary link", kind: "text" },
      { name: "secondaryLabel", label: "Secondary button", kind: "text" },
      { name: "secondaryHref", label: "Secondary link", kind: "text" },
      { name: "images", label: "Images", kind: "images" },
      {
        name: "align",
        label: "Alignment",
        kind: { select: [
          { value: "left", label: "Left" },
          { value: "center", label: "Centered" },
        ] },
      },
    ],
  },
  marquee: {
    label: "Marquee strip",
    hint: "Scrolling text band.",
    fields: [{ name: "text", label: "Text", kind: "text" }],
  },
  productGrid: {
    label: "Product grid",
    hint: "A row of teas from a collection or the featured / newest list.",
    fields: [
      { name: "heading", label: "Heading", kind: "text" },
      { name: "subheading", label: "Subheading", kind: "text" },
      {
        name: "source",
        label: "Products",
        kind: { select: [
          { value: "featured", label: "Featured" },
          { value: "new", label: "Newest" },
          { value: "collection", label: "From a collection" },
        ] },
      },
      { name: "collectionSlug", label: "Collection (if chosen above)", kind: "collection" },
      { name: "limit", label: "How many", kind: "number" },
    ],
  },
  collections: {
    label: "Collections grid",
    hint: "Cards for every active collection.",
    fields: [{ name: "heading", label: "Heading", kind: "text" }],
  },
  banner: {
    label: "Call-to-action banner",
    hint: "Full-width strip with a heading and one button.",
    fields: [
      { name: "heading", label: "Heading", kind: "text" },
      { name: "body", label: "Body", kind: "textarea" },
      { name: "ctaLabel", label: "Button label", kind: "text" },
      { name: "ctaHref", label: "Button link", kind: "text" },
      { name: "image", label: "Background image (optional)", kind: "image" },
      {
        name: "tone",
        label: "Tone",
        kind: { select: [
          { value: "gold", label: "Gold" },
          { value: "dark", label: "Dark" },
        ] },
      },
    ],
  },
  story: {
    label: "Story / feature",
    hint: "Image on one side, text on the other.",
    fields: [
      { name: "heading", label: "Heading", kind: "text" },
      { name: "body", label: "Body", kind: "textarea" },
      { name: "image", label: "Image", kind: "image" },
      {
        name: "imageSide",
        label: "Image side",
        kind: { select: [
          { value: "left", label: "Left" },
          { value: "right", label: "Right" },
        ] },
      },
    ],
  },
  richText: {
    label: "Text section",
    hint: "A heading and a paragraph. Line breaks are kept.",
    fields: [
      { name: "heading", label: "Heading", kind: "text" },
      { name: "body", label: "Body", kind: "textarea" },
      {
        name: "align",
        label: "Alignment",
        kind: { select: [
          { value: "left", label: "Left" },
          { value: "center", label: "Centered" },
        ] },
      },
    ],
  },
};

export const BLOCK_ORDER: BlockType[] = [
  "hero",
  "productGrid",
  "collections",
  "banner",
  "story",
  "marquee",
  "richText",
];

/* ------------------------------ defaults ------------------------------- */

function newId() {
  try {
    return crypto.randomUUID();
  } catch {
    return "b_" + Math.random().toString(36).slice(2, 10);
  }
}

export function defaultBlock(type: BlockType): Block {
  const id = newId();
  switch (type) {
    case "hero":
      return {
        id, type,
        eyebrow: "Single-origin tea · Sreemangal, Bangladesh",
        headline: "One garden.\nOne team.\nNo blending.",
        subtext:
          "Orthodox black, pan-fired green and hand-rolled oolong — grown and processed on Kuri Valley Estate.",
        primaryLabel: "Shop the teas",
        primaryHref: "/shop",
        secondaryLabel: "",
        secondaryHref: "",
        images: [],
        align: "left",
      };
    case "marquee":
      return { id, type, text: "Free delivery over ৳3000 · Roasted close to your ship date · Subscribe & save 10%" };
    case "productGrid":
      return {
        id, type,
        heading: "This season's teas",
        subheading: "Small-batch, single-origin, picked on the estate.",
        source: "featured",
        collectionSlug: "",
        limit: 8,
      };
    case "collections":
      return { id, type, heading: "Collections" };
    case "banner":
      return {
        id, type,
        heading: "Tea from one garden, not a blend of many",
        body: "Follow along for harvest notes, brewing guides and restocks.",
        ctaLabel: "Start shopping",
        ctaHref: "/shop",
        image: "",
        tone: "gold",
      };
    case "story":
      return {
        id, type,
        heading: "Picked and processed on the estate",
        body: "Every batch is plucked, withered, rolled and fired at Kuri Valley Estate — never trucked out to a blending house.",
        image: "",
        imageSide: "left",
      };
    case "richText":
      return { id, type, heading: "", body: "", align: "left" };
  }
}

/* --------------------------- safe parsing ----------------------------- */

const KNOWN = new Set<string>(BLOCK_ORDER);

/** Parse stored JSON into a clean Block[]. Unknown/broken entries are dropped;
 *  missing props are filled from defaults so the renderer never sees `undefined`. */
export function parseBlocks(json: string | null | undefined): Block[] {
  if (!json) return [];
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    return [];
  }
  if (!Array.isArray(raw)) return [];
  const out: Block[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const e = entry as Record<string, unknown>;
    const type = e.type as BlockType;
    if (!KNOWN.has(type)) continue;
    const base = defaultBlock(type) as Record<string, unknown>;
    // Coerce every prop to the type its default has, so a corrupt stored block
    // (e.g. images:"x", limit:"8") can't crash the renderer.
    const merged: Record<string, unknown> = { ...base };
    for (const [k, def] of Object.entries(base)) {
      const v = e[k];
      if (v === undefined) continue;
      if (Array.isArray(def)) {
        merged[k] = Array.isArray(v) ? v.filter((x) => typeof x === "string") : def;
      } else if (typeof def === "number") {
        const n = Number(v);
        merged[k] = Number.isFinite(n) ? n : def;
      } else if (typeof def === "string") {
        merged[k] = typeof v === "string" ? v : def;
      } else {
        merged[k] = v;
      }
    }
    merged.id = typeof e.id === "string" ? e.id : base.id;
    merged.type = type;
    out.push(merged as unknown as Block);
  }
  return out;
}

export function serializeBlocks(blocks: Block[]): string {
  return JSON.stringify(blocks);
}

/* --------------------- reserved landing-page slugs -------------------- */

export const RESERVED_SLUGS = new Set([
  "home", "shop", "cart", "checkout", "product", "products", "collection",
  "collections", "account", "login", "register", "logout", "track", "order",
  "orders", "about", "contact", "journal", "subscriptions", "our-origin",
  "our-story", "photo-credits", "admin", "api", "search", "p", "pages",
  "_next", "favicon.ico", "sitemap.xml", "robots.txt",
]);
