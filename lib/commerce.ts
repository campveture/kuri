// Product data layer.
//
// There is no Shopify store connected yet, so this returns local mock data
// shaped like a simplified Storefront API response. Prices below are SAMPLE
// placeholder values (BDT) so cart math and the UI have something real to
// work with -- swap in real prices, and eventually replace the functions
// below with Shopify Storefront API (GraphQL) calls, keeping the same
// `Product` shape and function signatures so the rest of the app doesn't
// need to change.

export type PurchaseOption = "one-time" | "subscribe";

export type Product = {
  handle: string;
  name: string;
  category: string;
  tastingNotes: string[];
  price: number; // BDT, sample placeholder
  subscribePrice: number; // BDT, sample placeholder (10% off)
  color: string;
  colorDark: string;
  shortDescription: string;
  description: string;
  origin: string;
  altitude: string;
  process: string;
  harvest: string;
  brew: {
    temp: string;
    dose: string;
    steepTime: string;
    bestWith: string;
  };
};

export const products: Product[] = [
  {
    handle: "sreemangal-orthodox-black",
    name: "Sreemangal Orthodox Black",
    category: "Black Tea",
    tastingNotes: ["Malt", "Honey", "Stone Fruit"],
    price: 450,
    subscribePrice: 405,
    color: "#C89A3E",
    colorDark: "#A97F2E",
    shortDescription:
      "Our flagship black tea, hand-rolled in small batches from the upper rows of Kuri Valley Estate. Malty, honeyed, full-bodied -- built for a proper cup with milk or without.",
    description:
      "Our flagship black tea, hand-rolled in small batches from the upper rows of Kuri Valley Estate. Malty, honeyed, full-bodied -- built for a proper cup with milk or without.",
    origin: "Kuri Valley Estate, Sreemangal",
    altitude: "[ALTITUDE] m",
    process: "Orthodox, fully oxidised",
    harvest: "[SEASON] Flush",
    brew: { temp: "[TEMP]", dose: "[DOSE]", steepTime: "[STEEP TIME]", bestWith: "A splash of milk, or plain" },
  },
  {
    handle: "first-flush-green",
    name: "First Flush Green",
    category: "Green Tea",
    tastingNotes: ["Grassy", "Citrus"],
    price: 480,
    subscribePrice: 432,
    color: "#5F7350",
    colorDark: "#485939",
    shortDescription:
      "Pan-fired within hours of plucking to lock in a bright, grassy cup with a clean citrus finish.",
    description:
      "Picked at the very start of the season and pan-fired within hours to stop oxidation almost entirely. Bright, grassy, with a clean citrus finish -- best brewed cooler and shorter than the black teas.",
    origin: "Kuri Valley Estate, Sreemangal",
    altitude: "[ALTITUDE] m",
    process: "Pan-fired, unoxidised",
    harvest: "[SEASON] Flush",
    brew: { temp: "[TEMP]", dose: "[DOSE]", steepTime: "[STEEP TIME]", bestWith: "Plain, no milk" },
  },
  {
    handle: "golden-tips-oolong",
    name: "Golden Tips Oolong",
    category: "Oolong Tea",
    tastingNotes: ["Stone Fruit", "Wood"],
    price: 650,
    subscribePrice: 585,
    color: "#B5623B",
    colorDark: "#8F4C2C",
    shortDescription:
      "Partially oxidised and hand-rolled, with a stone-fruit sweetness and a warm, woody finish.",
    description:
      "Our most labour-intensive tea: partially oxidised, hand-rolled over several passes to develop a stone-fruit sweetness that settles into a warm, woody finish. A small-batch, limited-harvest tea.",
    origin: "Kuri Valley Estate, Sreemangal",
    altitude: "[ALTITUDE] m",
    process: "Orthodox, partially oxidised",
    harvest: "[SEASON] Flush",
    brew: { temp: "[TEMP]", dose: "[DOSE]", steepTime: "[STEEP TIME]", bestWith: "Plain, re-steep 2-3 times" },
  },
  {
    handle: "evening-ctc",
    name: "Evening CTC",
    category: "Black Tea",
    tastingNotes: ["Cocoa", "Spice"],
    price: 380,
    subscribePrice: 342,
    color: "#4A4235",
    colorDark: "#332C22",
    shortDescription:
      "A bold, brisk CTC built for an evening cup with milk -- cocoa and spice notes that hold up well.",
    description:
      "Crush-Tear-Curl processing for a bold, brisk cup that stands up to milk and sugar. Cocoa and spice notes come through even in a strong pot -- our everyday, end-of-day tea.",
    origin: "Kuri Valley Estate, Sreemangal",
    altitude: "[ALTITUDE] m",
    process: "CTC, fully oxidised",
    harvest: "[SEASON] Flush",
    brew: { temp: "[TEMP]", dose: "[DOSE]", steepTime: "[STEEP TIME]", bestWith: "With milk" },
  },
];

export function getAllProducts(): Product[] {
  return products;
}

export function getProductByHandle(handle: string): Product | undefined {
  return products.find((p) => p.handle === handle);
}

export function getRelatedProducts(handle: string, count = 3): Product[] {
  return products.filter((p) => p.handle !== handle).slice(0, count);
}
