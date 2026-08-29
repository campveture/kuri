import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const WITH_SAMPLE_DATA = process.env.SEED_SAMPLE_DATA !== "false";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@kuri.com.bd";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "KuriEstate@2026";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/[\s_-]+/g, "-");
}
function token(n = 6) {
  const a = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let o = "";
  for (let i = 0; i < n; i++) o += a[Math.floor(Math.random() * a.length)];
  return o;
}

const CATEGORIES = [
  { name: "Black Tea", slug: "black-tea", description: "Fully oxidised — orthodox and CTC." },
  { name: "Green Tea", slug: "green-tea", description: "Pan-fired within hours of plucking." },
  { name: "Oolong Tea", slug: "oolong-tea", description: "Partially oxidised, hand-rolled." },
];

const TEAS = [
  {
    name: "Sreemangal Orthodox Black",
    category: "black-tea",
    price: 450,
    subscribePrice: 405,
    costPrice: 260,
    accent: "#C89A3E",
    accentDark: "#A97F2E",
    tastingNotes: ["Malt", "Honey", "Stone Fruit"],
    description:
      "Our flagship black tea, hand-rolled in small batches from the upper rows of Kuri Valley Estate. Malty, honeyed, full-bodied — built for a proper cup with milk or without.",
    process: "Orthodox, fully oxidised",
    featured: true,
  },
  {
    name: "First Flush Green",
    category: "green-tea",
    price: 480,
    subscribePrice: 432,
    costPrice: 275,
    accent: "#5F7350",
    accentDark: "#485939",
    tastingNotes: ["Grassy", "Citrus"],
    description:
      "Picked at the very start of the season and pan-fired within hours to stop oxidation almost entirely. Bright, grassy, with a clean citrus finish.",
    process: "Pan-fired, unoxidised",
    featured: true,
  },
  {
    name: "Golden Tips Oolong",
    category: "oolong-tea",
    price: 650,
    subscribePrice: 585,
    costPrice: 390,
    accent: "#B5623B",
    accentDark: "#8F4C2C",
    tastingNotes: ["Stone Fruit", "Wood"],
    description:
      "Our most labour-intensive tea: partially oxidised, hand-rolled over several passes to develop a stone-fruit sweetness that settles into a warm, woody finish.",
    process: "Orthodox, partially oxidised",
    featured: true,
  },
  {
    name: "Evening CTC",
    category: "black-tea",
    price: 380,
    subscribePrice: 342,
    costPrice: 210,
    accent: "#4A4235",
    accentDark: "#332C22",
    tastingNotes: ["Cocoa", "Spice"],
    description:
      "Crush-Tear-Curl processing for a bold, brisk cup that stands up to milk and sugar. Cocoa and spice notes come through even in a strong pot.",
    process: "CTC, fully oxidised",
    featured: false,
  },
];

const WEIGHTS = [
  { size: "50g", stock: 40 },
  { size: "100g", stock: 30 },
  { size: "250g", stock: 15 },
];

const POSTS = [
  {
    slug: "how-to-brew-a-proper-cup",
    title: "How to Brew a Proper Cup of Orthodox Black",
    category: "Brewing",
    excerpt:
      "Water temperature and steep time matter more than most people think. Here's how we brew it at the estate.",
    body: [
      "Most bad cups of tea aren't the tea's fault. They're a brewing problem — water too hot, too cold, or leaves left in far too long. Orthodox black tea rewards a bit of attention.",
      "Start with fresh water, off the boil rather than at a rolling boil. Water that's too hot scalds the leaf and pulls out bitterness before the sweetness has a chance to come through.",
      "Use about 3g of leaf per 200ml cup, and steep for 3–4 minutes. Pull the leaves out when the timer goes.",
      "Orthodox black holds up fine with a splash of milk, but we'd suggest tasting it plain first, at least the first time.",
    ],
  },
  {
    slug: "what-single-origin-actually-means",
    title: 'What "Single-Origin" Actually Means',
    category: "Our Approach",
    excerpt:
      "It gets used loosely. For us it means something specific: one estate, one season, nothing blended in.",
    body: [
      "Most tea on a supermarket shelf is a blend — leaf from dozens of gardens, sometimes several countries, mixed to hit a consistent taste year-round.",
      "Single-origin is the opposite. Every tea we sell is from one garden, picked in one season, processed on site. It tastes like the year it was made.",
    ],
  },
  {
    slug: "inside-a-sreemangal-harvest",
    title: "Inside a Sreemangal Harvest",
    category: "The Estate",
    excerpt: "What a plucking day looks like on Kuri Valley Estate, from first light to the withering trough.",
    body: [
      "Plucking starts early, before the heat. Two leaves and a bud — the standard, and harder to keep to than it sounds.",
      "By mid-morning the day's leaf is spread across withering troughs, losing moisture before it's rolled.",
    ],
  },
];

async function main() {
  // wipe (FK-safe order)
  await prisma.orderEvent.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.storeSaleItem.deleteMany();
  await prisma.storeSale.deleteMany();
  await prisma.inventoryLevel.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.location.deleteMany();
  await prisma.discount.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.category.deleteMany();
  await prisma.post.deleteMany();
  await prisma.page.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.loginAttempt.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  // admin
  await prisma.user.create({
    data: {
      name: "Kuri Admin",
      email: ADMIN_EMAIL.toLowerCase(),
      passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 10),
      role: "ADMIN",
    },
  });

  // settings
  const settings: Record<string, string> = {
    bkash_number: "[BKASH_NUMBER]",
    bkash_type: "Personal",
    nagad_number: "[NAGAD_NUMBER]",
    nagad_type: "Personal",
    shipping_inside_dhaka: "60",
    shipping_outside_dhaka: "120",
    free_shipping_threshold: "3000",
    announcement: "Free delivery on orders over ৳3000 · Shipped fresh from Sreemangal",
    featured_collection: "",
    show_new_arrivals: "true",
  };
  await prisma.setting.createMany({
    data: Object.entries(settings).map(([key, value]) => ({ key, value })),
  });

  // categories
  const catMap = new Map<string, string>();
  for (let i = 0; i < CATEGORIES.length; i++) {
    const c = await prisma.category.create({
      data: { ...CATEGORIES[i], position: i },
    });
    catMap.set(c.slug, c.id);
  }

  // teas
  for (let i = 0; i < TEAS.length; i++) {
    const t = TEAS[i];
    await prisma.product.create({
      data: {
        name: t.name,
        slug: slugify(t.name),
        description: t.description,
        price: t.price,
        subscribePrice: t.subscribePrice,
        costPrice: t.costPrice,
        categoryId: catMap.get(t.category)!,
        images: "[]",
        tags: t.tastingNotes.join(", ").toLowerCase(),
        featured: t.featured,
        position: i,
        tastingNotes: JSON.stringify(t.tastingNotes),
        origin: "Kuri Valley Estate, Sreemangal",
        process: t.process,
        accent: t.accent,
        accentDark: t.accentDark,
        variants: {
          create: WEIGHTS.map((w) => ({
            size: w.size,
            stock: w.stock,
            sku: `KV-${token()}-${w.size.toUpperCase()}`,
          })),
        },
      },
    });
  }

  // journal
  for (const p of POSTS) {
    await prisma.post.create({
      data: {
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        category: p.category,
        body: JSON.stringify(p.body),
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });
  }

  // home page (empty blocks — storefront falls back to the built-in homepage)
  await prisma.page.create({
    data: { slug: "home", title: "Home", status: "PUBLISHED", isHome: true, blocks: "[]" },
  });

  // online location (ERP)
  await prisma.location.create({
    data: { name: "Online Store", slug: "online", kind: "ONLINE", position: 0 },
  });

  console.log(
    `Seeded: 1 admin (${ADMIN_EMAIL}), ${CATEGORIES.length} categories, ${TEAS.length} teas, ${POSTS.length} journal posts.` +
      (WITH_SAMPLE_DATA ? "" : " (sample orders skipped)"),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
