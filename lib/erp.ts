import { prisma } from "@/lib/prisma";

/* ---------------------------------------------------------------------------
 * ERP data layer — physical stores, per-location stock, and combined P&L.
 *
 * Stock model: the ONLINE location's quantity for a variant IS
 * ProductVariant.stock (authoritative for checkout). STORE locations keep
 * their quantity in InventoryLevel rows. Reports union online Orders with
 * counter StoreSales.
 * ------------------------------------------------------------------------- */

export type LocationLite = {
  id: string;
  name: string;
  slug: string;
  kind: "ONLINE" | "STORE";
  active: boolean;
};

export async function getLocations(): Promise<LocationLite[]> {
  const rows = await prisma.location.findMany({
    orderBy: [{ kind: "asc" }, { position: "asc" }, { createdAt: "asc" }],
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    kind: r.kind,
    active: r.active,
  }));
}

export async function getOnlineLocation() {
  return prisma.location.findFirst({ where: { kind: "ONLINE" } });
}

/* ----------------------------- inventory ----------------------------- */

export type MatrixVariant = {
  variantId: string;
  size: string;
  online: number;
  byLocation: Record<string, number>; // locationId -> qty (STORE only)
};
export type MatrixProduct = {
  id: string;
  name: string;
  slug: string;
  costPrice: number;
  variants: MatrixVariant[];
};

export async function getInventoryMatrix() {
  const [products, storeLocations, levels] = await Promise.all([
    prisma.product.findMany({
      orderBy: { name: "asc" },
      include: { variants: { orderBy: { size: "asc" } } },
    }),
    prisma.location.findMany({
      where: { kind: "STORE" },
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    }),
    prisma.inventoryLevel.findMany(),
  ]);

  const key = (loc: string, v: string) => `${loc}:${v}`;
  const levelMap = new Map(levels.map((l) => [key(l.locationId, l.variantId), l.quantity]));

  const matrix: MatrixProduct[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    costPrice: p.costPrice,
    variants: p.variants.map((v) => ({
      variantId: v.id,
      size: v.size,
      online: v.stock,
      byLocation: Object.fromEntries(
        storeLocations.map((loc) => [loc.id, levelMap.get(key(loc.id, v.id)) ?? 0]),
      ),
    })),
  }));

  return {
    stores: storeLocations.map((l) => ({ id: l.id, name: l.name })),
    products: matrix,
  };
}

/* ------------------------------ reports ------------------------------ */

export type LocationPnl = {
  id: string;
  name: string;
  kind: "ONLINE" | "STORE";
  orders: number;
  units: number;
  revenue: number;
  cogs: number;
  grossProfit: number;
  expenses: number;
  netProfit: number;
  stockValue: number;
};

export type ErpReport = {
  from: string;
  to: string;
  locations: LocationPnl[];
  totals: Omit<LocationPnl, "id" | "name" | "kind">;
  expenseByCategory: { category: string; amount: number }[];
  salesByDay: { date: string; label: string; online: number; store: number }[];
};

const DAY = 24 * 60 * 60 * 1000;

export async function getErpReport(from: Date, to: Date): Promise<ErpReport> {
  const end = new Date(to.getTime());
  end.setHours(23, 59, 59, 999);
  const start = new Date(from.getTime());
  start.setHours(0, 0, 0, 0);

  const [locations, orders, orderItems, storeSales, expenses, variants, levels] =
    await Promise.all([
      prisma.location.findMany({
        orderBy: [{ kind: "asc" }, { position: "asc" }, { createdAt: "asc" }],
      }),
      prisma.order.findMany({
        where: { status: { not: "CANCELLED" }, createdAt: { gte: start, lte: end } },
        select: { total: true, createdAt: true },
      }),
      prisma.orderItem.findMany({
        where: {
          order: {
            status: { not: "CANCELLED" },
            createdAt: { gte: start, lte: end },
          },
        },
        select: { cost: true, quantity: true },
      }),
      prisma.storeSale.findMany({
        where: { createdAt: { gte: start, lte: end } },
        select: {
          locationId: true,
          total: true,
          cost: true,
          createdAt: true,
          items: { select: { quantity: true } },
        },
      }),
      prisma.expense.findMany({
        where: { incurredAt: { gte: start, lte: end } },
        select: { locationId: true, category: true, amount: true },
      }),
      prisma.product.findMany({
        select: { costPrice: true, variants: { select: { id: true, stock: true } } },
      }),
      prisma.inventoryLevel.findMany({ select: { locationId: true, variantId: true, quantity: true } }),
    ]);

  const online = locations.find((l) => l.kind === "ONLINE");

  // stock value: online from variant.stock, store from InventoryLevel
  const variantCost = new Map<string, number>();
  let onlineStockValue = 0;
  for (const p of variants) {
    for (const v of p.variants) {
      variantCost.set(v.id, p.costPrice);
      onlineStockValue += v.stock * p.costPrice;
    }
  }
  const stockValueByLocation = new Map<string, number>();
  if (online) stockValueByLocation.set(online.id, onlineStockValue);
  for (const l of levels) {
    const c = variantCost.get(l.variantId) ?? 0;
    stockValueByLocation.set(
      l.locationId,
      (stockValueByLocation.get(l.locationId) ?? 0) + l.quantity * c,
    );
  }

  // expenses
  const expenseByLocation = new Map<string, number>();
  let unassignedExpense = 0;
  const catMap = new Map<string, number>();
  for (const e of expenses) {
    if (e.locationId) {
      expenseByLocation.set(
        e.locationId,
        (expenseByLocation.get(e.locationId) ?? 0) + e.amount,
      );
    } else {
      unassignedExpense += e.amount;
    }
    catMap.set(e.category, (catMap.get(e.category) ?? 0) + e.amount);
  }

  // online figures
  const onlineRevenue = orders.reduce((n, o) => n + o.total, 0);
  const onlineCogs = orderItems.reduce((n, it) => n + it.cost * it.quantity, 0);
  const onlineUnits = orderItems.reduce((n, it) => n + it.quantity, 0);

  // store figures
  const storeAgg = new Map<
    string,
    { revenue: number; cogs: number; units: number; orders: number }
  >();
  for (const s of storeSales) {
    const cur = storeAgg.get(s.locationId) ?? { revenue: 0, cogs: 0, units: 0, orders: 0 };
    cur.revenue += s.total;
    cur.cogs += s.cost;
    cur.units += s.items.reduce((n, i) => n + i.quantity, 0);
    cur.orders += 1;
    storeAgg.set(s.locationId, cur);
  }

  const pnl: LocationPnl[] = locations
    .filter((l) => l.kind === "STORE" || l.kind === "ONLINE")
    .map((l) => {
      const isOnline = l.kind === "ONLINE";
      const rev = isOnline ? onlineRevenue : storeAgg.get(l.id)?.revenue ?? 0;
      const cogs = isOnline ? onlineCogs : storeAgg.get(l.id)?.cogs ?? 0;
      const units = isOnline ? onlineUnits : storeAgg.get(l.id)?.units ?? 0;
      const ordersN = isOnline ? orders.length : storeAgg.get(l.id)?.orders ?? 0;
      const exp = expenseByLocation.get(l.id) ?? 0;
      const gross = rev - cogs;
      return {
        id: l.id,
        name: l.name,
        kind: l.kind,
        orders: ordersN,
        units,
        revenue: rev,
        cogs,
        grossProfit: gross,
        expenses: exp,
        netProfit: gross - exp,
        stockValue: stockValueByLocation.get(l.id) ?? 0,
      };
    });

  const sum = (k: keyof Omit<LocationPnl, "id" | "name" | "kind">) =>
    pnl.reduce((n, p) => n + (p[k] as number), 0);

  const totalExpenses = sum("expenses") + unassignedExpense;
  const totalGross = sum("grossProfit");
  const totals = {
    orders: sum("orders"),
    units: sum("units"),
    revenue: sum("revenue"),
    cogs: sum("cogs"),
    grossProfit: totalGross,
    expenses: totalExpenses,
    netProfit: totalGross - totalExpenses,
    stockValue: sum("stockValue"),
  };

  // daily series (cap at ~60 buckets)
  const spanDays = Math.min(
    90,
    Math.max(1, Math.round((end.getTime() - start.getTime()) / DAY) + 1),
  );
  const buckets = new Map<string, { online: number; store: number }>();
  for (let i = 0; i < spanDays; i++) {
    const d = new Date(start.getTime() + i * DAY);
    buckets.set(d.toISOString().slice(0, 10), { online: 0, store: 0 });
  }
  for (const o of orders) {
    const b = buckets.get(new Date(o.createdAt).toISOString().slice(0, 10));
    if (b) b.online += o.total;
  }
  for (const s of storeSales) {
    const b = buckets.get(new Date(s.createdAt).toISOString().slice(0, 10));
    if (b) b.store += s.total;
  }
  const salesByDay = [...buckets.entries()].map(([date, v]) => ({
    date,
    label: new Date(date + "T00:00:00").toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    }),
    online: v.online,
    store: v.store,
  }));

  const expenseByCategory = [...catMap.entries()]
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  return {
    from: start.toISOString().slice(0, 10),
    to: end.toISOString().slice(0, 10),
    locations: pnl,
    totals,
    expenseByCategory,
    salesByDay,
  };
}
