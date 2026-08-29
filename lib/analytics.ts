import { prisma } from "@/lib/prisma";

export type DashboardAnalytics = {
  salesByDay: { date: string; label: string; total: number; orders: number }[];
  topProducts: { name: string; units: number; revenue: number }[];
  statusCounts: { status: string; count: number }[];
  windowDays: number;
};

const DAY = 24 * 60 * 60 * 1000;

export async function getDashboardAnalytics(
  windowDays = 14,
): Promise<DashboardAnalytics> {
  const now = new Date();
  const start = new Date(now.getTime() - (windowDays - 1) * DAY);
  start.setHours(0, 0, 0, 0);

  const [orders, items, statusGroups] = await Promise.all([
    prisma.order.findMany({
      where: { status: { not: "CANCELLED" }, createdAt: { gte: start } },
      select: { createdAt: true, total: true },
    }),
    prisma.orderItem.groupBy({
      by: ["productName"],
      where: {
        order: { status: { not: "CANCELLED" }, createdAt: { gte: start } },
      },
      _sum: { quantity: true, price: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 6,
    }),
    prisma.order.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  // bucket by local day
  const buckets = new Map<string, { total: number; orders: number }>();
  for (let i = 0; i < windowDays; i++) {
    const d = new Date(start.getTime() + i * DAY);
    buckets.set(d.toISOString().slice(0, 10), { total: 0, orders: 0 });
  }
  for (const o of orders) {
    const key = new Date(o.createdAt).toISOString().slice(0, 10);
    const b = buckets.get(key);
    if (b) {
      b.total += o.total;
      b.orders += 1;
    }
  }

  const salesByDay = [...buckets.entries()].map(([date, b]) => ({
    date,
    label: new Date(date + "T00:00:00").toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    }),
    total: b.total,
    orders: b.orders,
  }));

  const topProducts = items.map((it) => ({
    name: it.productName,
    units: it._sum.quantity ?? 0,
    revenue: 0,
  }));

  // revenue per product needs qty*price per row, not a group sum
  const revRows = await prisma.orderItem.findMany({
    where: {
      order: { status: { not: "CANCELLED" }, createdAt: { gte: start } },
      productName: { in: topProducts.map((t) => t.name) },
    },
    select: { productName: true, price: true, quantity: true },
  });
  const revByName = new Map<string, number>();
  for (const r of revRows) {
    revByName.set(
      r.productName,
      (revByName.get(r.productName) ?? 0) + r.price * r.quantity,
    );
  }
  for (const t of topProducts) t.revenue = revByName.get(t.name) ?? 0;

  const ORDER = ["PENDING", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"];
  const statusCounts = ORDER.map((s) => ({
    status: s,
    count: statusGroups.find((g) => g.status === s)?._count._all ?? 0,
  })).filter((s) => s.count > 0);

  return { salesByDay, topProducts, statusCounts, windowDays };
}
