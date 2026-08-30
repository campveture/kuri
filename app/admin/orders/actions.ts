"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { getSettings, calcShipping } from "@/lib/settings";
import { generateOrderNumber, parseImages } from "@/lib/utils";
import { manualOrderSchema } from "@/lib/validators";

type ManualOrderInput = Record<string, unknown>;

export async function createManualOrder(
  raw: ManualOrderInput,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const admin = await requireAdmin();

  const parsed = manualOrderSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Check the order fields.",
    };
  }
  const input = parsed.data;
  const lines = input.items;

  const settings = await getSettings();
  const products = await prisma.product.findMany({
    where: {
      id: { in: Array.from(new Set(lines.map((l) => l.productId))) },
      active: true,
    },
    include: { variants: true },
  });

  const resolved: {
    productId: string;
    productName: string;
    image: string;
    size: string;
    price: number;
    cost: number;
    quantity: number;
    variantId: string;
  }[] = [];

  for (const l of lines) {
    const p = products.find((x) => x.id === l.productId);
    if (!p) return { ok: false, error: "A product is no longer available." };
    const v = p.variants.find((x) => x.size === l.size);
    if (!v) return { ok: false, error: `${p.name}: weight ${l.size} not found.` };
    if (v.stock < l.quantity)
      return {
        ok: false,
        error: `${p.name} (${l.size}) — only ${v.stock} in stock.`,
      };
    resolved.push({
      productId: p.id,
      productName: p.name,
      image: parseImages(p.images)[0] ?? "",
      size: l.size,
      price: p.price,
      cost: p.costPrice,
      quantity: l.quantity,
      variantId: v.id,
    });
  }

  const subtotal = resolved.reduce((n, r) => n + r.price * r.quantity, 0);
  const shipping =
    input.shippingOverride != null && input.shippingOverride >= 0
      ? Math.round(input.shippingOverride)
      : calcShipping(subtotal, input.city || "Dhaka", settings);
  const total = subtotal + shipping;

  let orderId = "";
  try {
    for (let attempt = 1; ; attempt++) {
      const orderNumber = generateOrderNumber();
      try {
        const created = await prisma.$transaction(async (tx) => {
          for (const r of resolved) {
            const res = await tx.productVariant.updateMany({
              where: { id: r.variantId, stock: { gte: r.quantity } },
              data: { stock: { decrement: r.quantity } },
            });
            if (res.count === 0)
              throw new Error(`${r.productName} (${r.size}) is out of stock.`);
          }
          return tx.order.create({
            data: {
              orderNumber,
              customerName: input.customerName.trim(),
              phone: input.phone.trim(),
              email: input.email?.trim() || null,
              addressLine: input.addressLine?.trim() || "—",
              area: input.area?.trim() || "—",
              city: input.city?.trim() || "Dhaka",
              note: input.note?.trim() || null,
              paymentMethod: input.paymentMethod,
              paymentStatus: input.paymentStatus,
              status: input.status,
              source: "admin",
              subtotal,
              shipping,
              total,
              items: {
                create: resolved.map((r) => ({
                  productId: r.productId,
                  productName: r.productName,
                  image: r.image,
                  size: r.size,
                  price: r.price,
                  cost: r.cost,
                  quantity: r.quantity,
                })),
              },
              timeline: {
                create: [
                  {
                    label: "Order created",
                    note: `Manual order by ${admin.email}`,
                  },
                ],
              },
            },
          });
        });
        orderId = created.id;
        break;
      } catch (e) {
        const err = e as { code?: string; meta?: { target?: unknown } };
        if (
          err?.code === "P2002" &&
          String(err?.meta?.target ?? "").includes("orderNumber") &&
          attempt < 4
        ) {
          continue;
        }
        throw e;
      }
    }
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not create the order.",
    };
  }

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/shop");
  return { ok: true, id: orderId };
}
