// Journal (blog) content. Draft placeholder copy in Kuri's voice, per the
// user's go-ahead -- hard facts that need real answers stay bracketed.

export type JournalPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  color: string;
  image: string;
  imageAlt: string;
  body: string[];
};

export const journalPosts: JournalPost[] = [
  {
    slug: "how-to-brew-a-proper-cup",
    title: "How to Brew a Proper Cup of Orthodox Black",
    excerpt:
      "Water temperature and steep time matter more than most people think. Here's how we brew it at the estate.",
    category: "Brewing",
    date: "[DATE]",
    color: "#C89A3E",
    image: "tea-cup.jpg",
    imageAlt: "A cup of black tea brewed in Srimangal, Bangladesh",
    body: [
      "Most bad cups of tea aren't the tea's fault. They're a brewing problem -- water too hot, too cold, or leaves left in far too long. Orthodox black tea rewards a bit of attention.",
      "Start with fresh water, off the boil rather than at a rolling boil -- give it a few seconds to settle to around [TEMP]°C. Water that's too hot scalds the leaf and pulls out bitterness before the sweetness has a chance to come through.",
      "Use about [DOSE]g of leaf per 200ml cup, and steep for [STEEP TIME]. Pull the leaves out when the timer goes -- don't leave them sitting in the pot, even between refills.",
      "Orthodox black holds up fine with a splash of milk, but we'd suggest tasting it plain first, at least the first time. You'll pick up the malt and honey notes that get muted once the milk goes in.",
    ],
  },
  {
    slug: "what-single-origin-actually-means",
    title: "What \"Single-Origin\" Actually Means",
    excerpt:
      "It gets used loosely. For us it means something specific: one estate, one season, nothing blended in.",
    category: "Our Approach",
    date: "[DATE]",
    color: "#5F7350",
    image: "teaser-1.jpg",
    imageAlt: "Close-up of tea leaves on the bush at a Sreemangal tea garden",
    body: [
      "\"Single-origin\" gets printed on a lot of packaging that doesn't fully earn it. For us, it's not a marketing line -- it's the whole operating model.",
      "Most tea you'll find on a shelf is blended: leaf from several gardens, sometimes several countries, mixed to hit a consistent flavor profile batch after batch. That's a reasonable way to run a large tea business. It's just not what we do.",
      "Everything Kuri sells comes off Kuri Valley Estate in Sreemangal -- one hillside, one team of pickers, one harvest at a time. That means the tea can vary a little season to season, the way wine does. We think that's a feature, not a defect.",
      "It also means we can tell you exactly where a bag came from, down to the harvest window, because there's only one answer to that question.",
    ],
  },
  {
    slug: "inside-a-sreemangal-harvest",
    title: "Inside a Sreemangal Harvest",
    excerpt:
      "A walk through what actually happens between a tea leaf being plucked and a bag landing on your counter.",
    category: "Our Origin",
    date: "[DATE]",
    color: "#B5623B",
    image: "harvest.jpg",
    imageAlt: "Tea garden workers weighing freshly picked leaves in Sreemangal",
    body: [
      "Sreemangal mornings start early, before the heat sets in. Pickers move through the rows plucking two leaves and a bud at a time -- the same standard used across most quality gardens, and one that resists being rushed.",
      "What's plucked in the morning is withered the same day, spread thin so the leaf loses moisture and turns pliable enough to roll without shattering.",
      "Rolling breaks the leaf's cell walls and starts oxidation -- this is the step that decides whether a batch ends up closer to our green tea or our black tea, depending on how long it's allowed to run.",
      "The last steps, firing and sorting, lock in the flavor developed in the rows and grade the leaf by hand before it's packed. From pluck to packed bag, the whole process usually takes [X] hours, start to finish.",
    ],
  },
];

export function getAllJournalPosts(): JournalPost[] {
  return journalPosts;
}

export function getJournalPostBySlug(slug: string): JournalPost | undefined {
  return journalPosts.find((p) => p.slug === slug);
}
