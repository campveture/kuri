import { prisma } from "@/lib/prisma";

/* ------------------------------------------------------------------ *
 * Per-page content model.
 *
 * The hand-built marketing pages keep their exact designs; every text
 * string / image path they render is captured here as a default and can
 * be overridden per page via the `PageContent` table (a JSON blob).
 *
 * DEFAULTS hold the *exact* text currently hardcoded on each page, with
 * HTML entities resolved to their rendered characters (— em dash,
 *   non-breaking space, “/” curly quotes, · middot)
 * so that, with no override stored, the rendered output is byte-identical
 * to today.
 * ------------------------------------------------------------------ */

/* ----------------------------- page keys ---------------------------- */

export type PageKey = "our-origin" | "our-story" | "subscriptions" | "contact";

export const PAGE_KEYS: PageKey[] = [
  "our-origin",
  "our-story",
  "subscriptions",
  "contact",
];

export const PAGE_LABELS: Record<PageKey, string> = {
  "our-origin": "Our Origin",
  "our-story": "Our Story",
  subscriptions: "Subscriptions",
  contact: "Contact",
};

export const PAGE_PATHS: Record<PageKey, string> = {
  "our-origin": "/our-origin",
  "our-story": "/our-story",
  subscriptions: "/subscriptions",
  contact: "/contact",
};

export function isPageKey(value: string): value is PageKey {
  return (PAGE_KEYS as readonly string[]).includes(value);
}

/* ------------------------------- types ----------------------------- */

type StatCard = { label: string; value: string };
type ProcessStep = { title: string; body: string };
type Milestone = { year: string; label: string; body: string };
type ValueItem = { title: string; body: string };
type FrequencyOption = { label: string };
type FaqItem = { question: string; answer: string };

export type OurOriginContent = {
  hero: {
    breadcrumb: string;
    eyebrow: string;
    headline: string;
    image: string;
    imageAlt: string;
  };
  region: {
    eyebrow: string;
    heading: string;
    body: string;
    stats: StatCard[];
  };
  estate: {
    image: string;
    imageAlt: string;
    eyebrow: string;
    heading: string;
    body: string;
  };
  process: {
    eyebrow: string;
    heading: string;
    steps: ProcessStep[];
  };
  quote: {
    text: string;
    attribution: string;
  };
  cta: {
    heading: string;
    buttonLabel: string;
  };
};

export type OurStoryContent = {
  hero: {
    eyebrow: string;
    headline: string;
    body: string;
  };
  founder: {
    eyebrow: string;
    name: string;
    body: string;
  };
  timeline: {
    eyebrow: string;
    heading: string;
    milestones: Milestone[];
  };
  values: {
    image: string;
    imageAlt: string;
    eyebrow: string;
    heading: string;
    items: ValueItem[];
  };
  cta: {
    heading: string;
    buttonLabel: string;
  };
};

export type SubscriptionsContent = {
  hero: {
    eyebrow: string;
    headline: string;
    body: string;
    buttonLabel: string;
  };
  howItWorks: {
    eyebrow: string;
    heading: string;
    steps: ProcessStep[];
  };
  frequency: {
    eyebrow: string;
    heading: string;
    chipLabel: string;
    note: string;
    options: FrequencyOption[];
  };
  faq: {
    eyebrow: string;
    heading: string;
    items: FaqItem[];
  };
};

export type ContactContent = {
  hero: {
    eyebrow: string;
    headline: string;
    body: string;
  };
  image: {
    src: string;
    alt: string;
  };
  details: {
    emailLabel: string;
    email: string;
    phoneLabel: string;
    phone: string;
    addressLabel: string;
    address: string;
  };
};

type ContentMap = {
  "our-origin": OurOriginContent;
  "our-story": OurStoryContent;
  subscriptions: SubscriptionsContent;
  contact: ContactContent;
};

export type ContentOf<K extends PageKey> = ContentMap[K];

/* ----------------------------- defaults ---------------------------- */

const DEFAULTS: { [K in PageKey]: ContentMap[K] } = {
  "our-origin": {
    hero: {
      breadcrumb: "Home / Our Origin",
      eyebrow: "Sreemangal, Sylhet Division, Bangladesh",
      headline: "Kuri Valley Estate",
      image: "/images/shop-banner.jpg",
      imageAlt: "A path through tea garden rows in Sreemangal, Bangladesh",
    },
    region: {
      eyebrow: "01 — The Region",
      heading: "Bangladesh's tea country",
      body: "Sreemangal is Bangladesh's tea capital — rolling hills, pineapple groves, and more than a hundred gardens spread across Sylhet division in the country's northeast. The climate here, warm and wet for most of the year, is what lets tea grow at all this far from the Himalayan gardens most people picture when they think of South Asian tea.",
      stats: [
        { label: "Region", value: "Sreemangal, Sylhet" },
        { label: "Elevation", value: "[ALTITUDE] m" },
        { label: "Established", value: "[YEAR]" },
        { label: "Harvest", value: "[SEASON] Flush" },
      ],
    },
    estate: {
      image: "/images/teaser-1.jpg",
      imageAlt: "Close-up of tea leaves at Sreemangal's tea gardens",
      eyebrow: "02 — The Estate",
      heading: "One garden, one team",
      body: "Kuri Valley is a single, family-run garden — not a cooperative of many small plots blended together. The same pickers return season after season; many have worked these rows for [X] years. What goes into a Kuri bag came off one hillside, picked by people who know it by name, not by lot number.",
    },
    process: {
      eyebrow: "03 — The Process",
      heading: "Leaf to cup",
      steps: [
        { title: "Pluck", body: "Two leaves and a bud, by hand, at first light." },
        { title: "Wither", body: "Spread thin, air-dried until soft and pliable." },
        { title: "Roll", body: "Hand-rolled to break the leaf and release oils." },
        { title: "Oxidise", body: "Timed by feel and smell, not by the clock alone." },
        { title: "Dry & Sort", body: "Fired to lock in flavor, then graded by hand." },
      ],
    },
    quote: {
      text: "“The valley decides the harvest. We just try not to get in the way.”",
      attribution: "Kuri Valley Estate · Sreemangal",
    },
    cta: {
      heading: "Taste the valley.",
      buttonLabel: "Shop Our Teas",
    },
  },

  "our-story": {
    hero: {
      eyebrow: "Our Story",
      headline: "Why Kuri exists",
      body: "[FOUNDER NAME] started Kuri because Bangladesh grows genuinely good tea, and almost none of it was reaching people who'd actually seek it out. Sreemangal has been growing tea for generations -- most of it just never got a label people outside the region would recognize.",
    },
    founder: {
      eyebrow: "The Founder",
      name: "[FOUNDER NAME]",
      body: "[Two or three sentences on the founder's background and why they started Kuri -- what they did before, what took them to Sreemangal, and what convinced them a single-origin approach was worth the extra work. Replace this bracket with the real story.]",
    },
    timeline: {
      eyebrow: "How We Got Here",
      heading: "A short timeline",
      milestones: [
        {
          year: "[YEAR]",
          label: "The idea",
          body: "A conversation about why good Bangladeshi tea rarely left Bangladesh.",
        },
        {
          year: "[YEAR]",
          label: "First harvest",
          body: "Our first season working directly with the estate in Sreemangal.",
        },
        {
          year: "[YEAR]",
          label: "First shipment",
          body: "The first bags of Kuri tea reached customers outside Sylhet.",
        },
        {
          year: "Today",
          label: "Kuri Valley Estate",
          body: "One garden, one team, a small and growing list of teas.",
        },
      ],
    },
    values: {
      image: "/images/hero-1.jpg",
      imageAlt: "Terraced tea garden hillside in Sreemangal",
      eyebrow: "What We Hold To",
      heading: "A few things we don't compromise on",
      items: [
        {
          title: "Single-origin, always",
          body: "Everything we sell comes from Kuri Valley Estate. No blending in leaf from elsewhere to hit a target flavor.",
        },
        {
          title: "Fair pay to pickers",
          body: "The people who pluck the leaf are paid [FAIR WAGE COMMITMENT] -- not just the estate's lowest legal rate.",
        },
        {
          title: "Small-batch roasting",
          body: "We roast in small batches so each run gets real attention, not a production line's worth of shortcuts.",
        },
      ],
    },
    cta: {
      heading: "Meet the valley itself.",
      buttonLabel: "See Our Origin",
    },
  },

  subscriptions: {
    hero: {
      eyebrow: "Subscriptions",
      headline: "Never run out of tea.",
      body: "Subscribe to any tea in the shop and save 10% on every order, delivered on whatever schedule actually matches how much you drink.",
      buttonLabel: "Start a Subscription",
    },
    howItWorks: {
      eyebrow: "How It Works",
      heading: "Three steps",
      steps: [
        {
          title: "Choose your tea & frequency",
          body: 'Pick any tea from the shop and select "Subscribe & save" at checkout, then choose how often it ships.',
        },
        {
          title: "We roast and ship fresh",
          body: "Each order is packed close to your ship date, not pulled from a warehouse shelf that's been sitting for months.",
        },
        {
          title: "Adjust or cancel anytime",
          body: "Change your tea, change your frequency, or cancel outright -- no minimum commitment.",
        },
      ],
    },
    frequency: {
      eyebrow: "Choose a Rhythm",
      heading: "Pick a frequency",
      chipLabel: "Save 10%",
      note: "Applies to any tea in the shop, changeable anytime.",
      options: [
        { label: "Every 4 weeks" },
        { label: "Every 6 weeks" },
        { label: "Every 8 weeks" },
      ],
    },
    faq: {
      eyebrow: "Questions",
      heading: "FAQ",
      items: [
        {
          question: "How much do I save?",
          answer:
            "Subscriptions are 10% off the one-time price on every tea, every order, for as long as the subscription runs.",
        },
        {
          question: "Can I change which tea I get?",
          answer:
            "Yes -- you can swap teas, change quantity, or change frequency before each order ships. [Details on how this works once account management is built.]",
        },
        {
          question: "When am I charged?",
          answer:
            "You're charged when each order ships, not in advance. [Confirm exact billing timing once a payment processor is connected.]",
        },
        {
          question: "Can I cancel anytime?",
          answer:
            "Yes, there's no minimum number of shipments and no cancellation fee.",
        },
      ],
    },
  },

  contact: {
    hero: {
      eyebrow: "Contact",
      headline: "Get in touch",
      body: "Questions about an order, wholesale, press, or anything else -- send us a note.",
    },
    image: {
      src: "/images/portrait.jpg",
      alt: "A path between tea garden rows in Sreemangal, Bangladesh",
    },
    details: {
      emailLabel: "Email",
      email: "[EMAIL]",
      phoneLabel: "Phone",
      phone: "[PHONE]",
      addressLabel: "Estate Address",
      address:
        "Kuri Valley Estate, Sreemangal, Sylhet, Bangladesh [FULL ADDRESS]",
    },
  },
};

/* --------------------------- deep merge ---------------------------- */

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * Merge `over` onto `base`:
 * - scalar missing (undefined/null) -> keep default
 * - array present -> use stored array as-is
 * - array missing -> keep default array
 * - nested objects -> merged recursively, only for keys defined on `base`
 */
function deepMerge<T>(base: T, over: unknown): T {
  if (Array.isArray(base)) {
    return (Array.isArray(over) ? over : base) as T;
  }
  if (isPlainObject(base)) {
    const out: Record<string, unknown> = { ...base };
    if (isPlainObject(over)) {
      for (const key of Object.keys(base)) {
        if (key in over) {
          out[key] = deepMerge(
            (base as Record<string, unknown>)[key],
            over[key],
          );
        }
      }
    }
    return out as T;
  }
  // scalar — a blank string falls back to the default too, so clearing a field
  // in the admin can't make a headline vanish or an <Image src=""> throw.
  if (over === undefined || over === null) return base;
  if (typeof base === "string" && base !== "" && over === "") return base;
  return over as T;
}

/* ------------------------- read for a page ------------------------- */

export async function getPageContent<K extends PageKey>(
  page: K,
): Promise<ContentOf<K>> {
  const base = DEFAULTS[page];
  let stored: unknown = undefined;
  try {
    const row = await prisma.pageContent.findUnique({ where: { page } });
    if (row?.data) {
      try {
        stored = JSON.parse(row.data);
      } catch {
        stored = undefined;
      }
    }
  } catch {
    stored = undefined;
  }
  return deepMerge(base, stored) as ContentOf<K>;
}

/* --------------------------- path helpers -------------------------- */

/** Read a dot-path (supports numeric segments for array indices). */
export function getAtPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc == null) return undefined;
    return (acc as Record<string, unknown>)[key];
  }, obj);
}

/** Immutable set at a dot-path; clones every container along the way. */
export function withPath<T>(obj: T, path: string, value: unknown): T {
  const keys = path.split(".");
  const clone: unknown = Array.isArray(obj) ? [...obj] : { ...(obj as object) };
  let cur = clone as Record<string, unknown>;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    const child = cur[k];
    cur[k] = Array.isArray(child)
      ? [...child]
      : { ...((child as object) ?? {}) };
    cur = cur[k] as Record<string, unknown>;
  }
  cur[keys[keys.length - 1]] = value;
  return clone as T;
}

/* ------------------------------ schema ----------------------------- */

export type Field = {
  path: string;
  label: string;
  kind: "text" | "textarea" | "image";
  hint?: string;
};

type ListSpec = {
  path: string;
  label: string;
  itemLabel: string;
  fields: Field[];
};

type PageSchema = {
  groups: { label: string; fields: Field[] }[];
  lists?: ListSpec[];
};

export const CONTENT_SCHEMA: Record<PageKey, PageSchema> = {
  "our-origin": {
    groups: [
      {
        label: "Hero",
        fields: [
          { path: "hero.breadcrumb", label: "Breadcrumb", kind: "text" },
          { path: "hero.eyebrow", label: "Eyebrow", kind: "text" },
          { path: "hero.headline", label: "Headline", kind: "text" },
          {
            path: "hero.image",
            label: "Hero image",
            kind: "image",
            hint: "Full-bleed banner behind the headline.",
          },
          { path: "hero.imageAlt", label: "Hero image alt text", kind: "text" },
        ],
      },
      {
        label: "01 — The Region",
        fields: [
          { path: "region.eyebrow", label: "Eyebrow", kind: "text" },
          { path: "region.heading", label: "Heading", kind: "text" },
          { path: "region.body", label: "Body", kind: "textarea" },
        ],
      },
      {
        label: "02 — The Estate",
        fields: [
          {
            path: "estate.image",
            label: "Estate image",
            kind: "image",
            hint: "Full-bleed photo behind the floating card.",
          },
          { path: "estate.imageAlt", label: "Estate image alt text", kind: "text" },
          { path: "estate.eyebrow", label: "Eyebrow", kind: "text" },
          { path: "estate.heading", label: "Heading", kind: "text" },
          { path: "estate.body", label: "Body", kind: "textarea" },
        ],
      },
      {
        label: "03 — The Process",
        fields: [
          { path: "process.eyebrow", label: "Eyebrow", kind: "text" },
          { path: "process.heading", label: "Heading", kind: "text" },
        ],
      },
      {
        label: "Quote band",
        fields: [
          { path: "quote.text", label: "Quote", kind: "textarea" },
          { path: "quote.attribution", label: "Attribution", kind: "text" },
        ],
      },
      {
        label: "Closing CTA",
        fields: [
          { path: "cta.heading", label: "Heading", kind: "text" },
          { path: "cta.buttonLabel", label: "Button label", kind: "text" },
        ],
      },
    ],
    lists: [
      {
        path: "region.stats",
        label: "Region stat cards",
        itemLabel: "Stat",
        fields: [
          { path: "label", label: "Label", kind: "text" },
          { path: "value", label: "Value", kind: "text" },
        ],
      },
      {
        path: "process.steps",
        label: "Process steps",
        itemLabel: "Step",
        fields: [
          { path: "title", label: "Title", kind: "text" },
          { path: "body", label: "Body", kind: "textarea" },
        ],
      },
    ],
  },

  "our-story": {
    groups: [
      {
        label: "Hero",
        fields: [
          { path: "hero.eyebrow", label: "Eyebrow", kind: "text" },
          { path: "hero.headline", label: "Headline", kind: "text" },
          { path: "hero.body", label: "Body", kind: "textarea" },
        ],
      },
      {
        label: "The Founder",
        fields: [
          { path: "founder.eyebrow", label: "Eyebrow", kind: "text" },
          { path: "founder.name", label: "Founder name", kind: "text" },
          { path: "founder.body", label: "Body", kind: "textarea" },
        ],
      },
      {
        label: "Timeline",
        fields: [
          { path: "timeline.eyebrow", label: "Eyebrow", kind: "text" },
          { path: "timeline.heading", label: "Heading", kind: "text" },
        ],
      },
      {
        label: "Values",
        fields: [
          {
            path: "values.image",
            label: "Values image",
            kind: "image",
            hint: "Full-bleed photo behind the values card.",
          },
          { path: "values.imageAlt", label: "Values image alt text", kind: "text" },
          { path: "values.eyebrow", label: "Eyebrow", kind: "text" },
          { path: "values.heading", label: "Heading", kind: "text" },
        ],
      },
      {
        label: "Closing CTA",
        fields: [
          { path: "cta.heading", label: "Heading", kind: "text" },
          { path: "cta.buttonLabel", label: "Button label", kind: "text" },
        ],
      },
    ],
    lists: [
      {
        path: "timeline.milestones",
        label: "Timeline milestones",
        itemLabel: "Milestone",
        fields: [
          { path: "year", label: "Year", kind: "text" },
          { path: "label", label: "Label", kind: "text" },
          { path: "body", label: "Body", kind: "textarea" },
        ],
      },
      {
        path: "values.items",
        label: "Value statements",
        itemLabel: "Value",
        fields: [
          { path: "title", label: "Title", kind: "text" },
          { path: "body", label: "Body", kind: "textarea" },
        ],
      },
    ],
  },

  subscriptions: {
    groups: [
      {
        label: "Hero",
        fields: [
          { path: "hero.eyebrow", label: "Eyebrow", kind: "text" },
          { path: "hero.headline", label: "Headline", kind: "text" },
          { path: "hero.body", label: "Body", kind: "textarea" },
          { path: "hero.buttonLabel", label: "Button label", kind: "text" },
        ],
      },
      {
        label: "How It Works",
        fields: [
          { path: "howItWorks.eyebrow", label: "Eyebrow", kind: "text" },
          { path: "howItWorks.heading", label: "Heading", kind: "text" },
        ],
      },
      {
        label: "Frequency",
        fields: [
          { path: "frequency.eyebrow", label: "Eyebrow", kind: "text" },
          { path: "frequency.heading", label: "Heading", kind: "text" },
          { path: "frequency.chipLabel", label: "Chip label", kind: "text" },
          {
            path: "frequency.note",
            label: "Card note",
            kind: "textarea",
            hint: "Shown under every frequency option.",
          },
        ],
      },
      {
        label: "FAQ",
        fields: [
          { path: "faq.eyebrow", label: "Eyebrow", kind: "text" },
          { path: "faq.heading", label: "Heading", kind: "text" },
        ],
      },
    ],
    lists: [
      {
        path: "howItWorks.steps",
        label: "How it works — steps",
        itemLabel: "Step",
        fields: [
          { path: "title", label: "Title", kind: "text" },
          { path: "body", label: "Body", kind: "textarea" },
        ],
      },
      {
        path: "frequency.options",
        label: "Frequency options",
        itemLabel: "Option",
        fields: [{ path: "label", label: "Label", kind: "text" }],
      },
      {
        path: "faq.items",
        label: "FAQ items",
        itemLabel: "Question",
        fields: [
          { path: "question", label: "Question", kind: "text" },
          { path: "answer", label: "Answer", kind: "textarea" },
        ],
      },
    ],
  },

  contact: {
    groups: [
      {
        label: "Hero",
        fields: [
          { path: "hero.eyebrow", label: "Eyebrow", kind: "text" },
          { path: "hero.headline", label: "Headline", kind: "text" },
          { path: "hero.body", label: "Body", kind: "textarea" },
        ],
      },
      {
        label: "Photo",
        fields: [
          { path: "image.src", label: "Photo", kind: "image" },
          { path: "image.alt", label: "Photo alt text", kind: "text" },
        ],
      },
      {
        label: "Contact details",
        fields: [
          { path: "details.emailLabel", label: "Email label", kind: "text" },
          {
            path: "details.email",
            label: "Email address",
            kind: "text",
            hint: "Also used to pre-fill the contact form's mail link.",
          },
          { path: "details.phoneLabel", label: "Phone label", kind: "text" },
          { path: "details.phone", label: "Phone number", kind: "text" },
          { path: "details.addressLabel", label: "Address label", kind: "text" },
          { path: "details.address", label: "Estate address", kind: "textarea" },
        ],
      },
    ],
  },
};

/* --------------------------- new list item ------------------------- */

/** A blank item shaped like the given list's items. */
export function newListItem(
  page: PageKey,
  listPath: string,
): Record<string, string> {
  const list = CONTENT_SCHEMA[page].lists?.find((l) => l.path === listPath);
  const item: Record<string, string> = {};
  for (const field of list?.fields ?? []) {
    item[field.path] = "";
  }
  return item;
}
