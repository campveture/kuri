import { defaultBlock, type Block, type BlockType } from "@/lib/blocks";

/** Compose a template from block types + per-block overrides. */
function make(steps: [BlockType, Partial<Block>?][]): Block[] {
  return steps.map(([type, over]) => ({ ...defaultBlock(type), ...over }) as Block);
}

export type PageTemplate = {
  key: string;
  name: string;
  description: string;
  blocks: () => Block[];
};

export const PAGE_TEMPLATES: PageTemplate[] = [
  {
    key: "blank",
    name: "Blank",
    description: "Start with nothing and add sections yourself.",
    blocks: () => [],
  },
  {
    key: "storefront",
    name: "Storefront classic",
    description: "Hero, collections, featured teas and a closing banner — the default homepage shape.",
    blocks: () =>
      make([
        ["hero"],
        ["collections"],
        ["productGrid", { heading: "This season's teas", source: "featured" } as Partial<Block>],
        ["banner"],
      ]),
  },
  {
    key: "harvest",
    name: "Harvest / seasonal",
    description: "Centered hero, a scrolling strip, a collection's teas, then a story block.",
    blocks: () =>
      make([
        ["hero", { align: "center", secondaryLabel: "" } as Partial<Block>],
        ["marquee"],
        ["productGrid", { heading: "This flush", source: "collection", limit: 12 } as Partial<Block>],
        ["story"],
      ]),
  },
  {
    key: "lookbook",
    name: "Story / estate",
    description: "Hero plus alternating image-and-text features and a newest-teas grid.",
    blocks: () =>
      make([
        ["hero", { secondaryLabel: "" } as Partial<Block>],
        ["story", { imageSide: "left" } as Partial<Block>],
        ["story", { imageSide: "right", heading: "Withered, rolled and fired on site" } as Partial<Block>],
        ["productGrid", { heading: "Just picked", source: "new" } as Partial<Block>],
      ]),
  },
  {
    key: "coming-soon",
    name: "Coming soon",
    description: "A single centered hero and a marquee — good for a teaser page.",
    blocks: () =>
      make([
        ["hero", {
          align: "center",
          eyebrow: "Coming soon",
          headline: "A new flush\nis on its way.",
          primaryLabel: "Notify me",
          primaryHref: "/contact",
          secondaryLabel: "",
        } as Partial<Block>],
        ["marquee", { text: "Sign up · Be first · One garden, one team, no blending" } as Partial<Block>],
      ]),
  },
];

export function templateByKey(key: string) {
  return PAGE_TEMPLATES.find((t) => t.key === key) ?? PAGE_TEMPLATES[0];
}
