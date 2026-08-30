"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { slugify, generateSaleNumber } from "@/lib/utils";

type Result = { ok: true; id?: string } | { ok: false; error: string };

function reval() {
  revalidatePath("/admin/stores");
  revalidatePath("/admin/stores/inventory");
  revalidatePath("/admin/stores/reports");
  revalidatePath("/admin");
}

/* ---------------------------- locations ---------------------------- */

export async function saveLocation(input: {
  id?: string;
  name: string;
  slug?: string;
  address?: string;
  phone?: string;
  active?: boolean;
}): Promise<Result> {
  await requireAdmin();
  const name = input.name.trim();
  if (!name) return { ok: false, error: "Enter a store name." };
  const slug = slugify(input.slug || name);
  if (!slug) return { ok: false, error: "That name can't be turned into a slug." };

  const clash = await prisma.location.findFirst({
    where: { slug, ...(input.id ? { id: { not: input.id } } : {}) },
    select: { id: true },
  });
  if (clash) return { ok: false, error: `Slug "${slug}" is already used.` };

  if (input.id) {
    const existing = await prisma.location.findUnique({ where: { id: input.id } });
    if (!existing) return { ok: false, error: "Store not found." };
    if (existing.kind === "ONLINE") {
      // Only the display name is editable for the online location.
      await prisma.location.update({ where: { id: input.id }, data: { name } });
    } else {
      await prisma.location.update({
        where: { id: input.id },
        data: {
          name,
          slug,
          address: input.address?.trim() || null,
          phone: input.phone?.trim() || null,
          active: input.active ?? true,
        },
      });
    }
    reval();
    return { ok: true, id: input.id };
  }

  const count = await prisma.location.count();
  const created = await prisma.location.create({
    data: {
      name,
      slug,
      kind: "STORE",
      address: input.address?.trim() || null,
      phone: input.phone?.trim() || null,
      active: input.active ?? true,
      position: count,
    },
  });
  reval();
  return { ok: true, id: created.id };
}

export async function toggleLocation(id: string, active: boolean): Promise<Result> {
  await requireAdmin();
  const loc = await prisma.location.findUnique({ where: { id } });
  if (!loc) return { ok: false, error: "Store not found." };
  if (loc.kind === "ONLINE")
    return { ok: false, error: "The online store can't be disabled here." };
  await prisma.location.update({ where: { id }, data: { active } });
  reval();
  return { ok: true };
}

export async function deleteLocation(id: string): Promise<Result> {
  await requireAdmin();
  const loc = await prisma.location.findUnique({ where: { id } });
  if (!loc) return { ok: false, error: "Store not found." };
  if (loc.kind === "ONLINE")
    return { ok: false, error: "The online store can't be deleted." };
  const sales = await prisma.storeSale.count({ where: { locationId: id } });
  if (sales > 0)
    return {
      ok: false,
      error: `This store has ${sales} recorded sale(s). Disable it instead of deleting.`,
    };
  await prisma.location.delete({ where: { id } }); // inventory levels cascade
  reval();
  return { ok: true };
}

/* --------------------------- stock adjust -------------------------- */

export async function adjustStock(input: {
  locationId: string;
  variantId: string;
  mode: "set" | "delta";
  value: number;
  note?: string;
}): Promise<Result> {
  await requireAdmin();
  const [loc, variant] = await Promise.all([
    prisma.location.findUnique({ where: { id: input.locationId } }),
    prisma.productVariant.findUnique({
      where: { id: input.variantId },
      include: { product: { select: { slug: true } } },
    }),
  ]);
  if (!loc || !variant) return { ok: false, error: "Store or variant not found." };
  const v = Math.trunc(Number(input.value));
  if (!Number.isFinite(v) || Math.abs(v) > 1_000_000)
    return { ok: false, error: "Enter a whole number." };

  const key = { locationId_variantId: { locationId: input.locationId, variantId: input.variantId } };

  await prisma.$transaction(async (tx) => {
    if (loc.kind === "ONLINE") {
      if (input.mode === "delta") {
        // conditional increment; clamp negatives to 0 in a follow-up
        await tx.productVariant.update({
          where: { id: input.variantId },
          data: { stock: { increment: v } },
        });
        await tx.productVariant.updateMany({
          where: { id: input.variantId, stock: { lt: 0 } },
          data: { stock: 0 },
        });
      } else {
        await tx.productVariant.update({
          where: { id: input.variantId },
          data: { stock: Math.max(0, v) },
        });
      }
    } else if (input.mode === "delta") {
      const cur = await tx.inventoryLevel.findUnique({ where: key });
      await tx.inventoryLevel.upsert({
        where: key,
        update: { quantity: Math.max(0, (cur?.quantity ?? 0) + v) },
        create: {
          locationId: input.locationId,
          variantId: input.variantId,
          quantity: Math.max(0, v),
        },
      });
    } else {
      await tx.inventoryLevel.upsert({
        where: key,
        update: { quantity: Math.max(0, v) },
        create: {
          locationId: input.locationId,
          variantId: input.variantId,
          quantity: Math.max(0, v),
        },
      });
    }
  });

  revalidatePath("/admin/stores/inventory");
  if (loc.kind === "ONLINE") {
    revalidatePath("/");
    revalidatePath("/shop");
    if (variant.product?.slug) revalidatePath(`/shop/${variant.product.slug}`);
  }
  return { ok: true };
}

export async function transferStock(input: {
  fromLocationId: string;
  toLocationId: string;
  variantId: string;
  quantity: number;
}): Promise<Result> {
  await requireAdmin();
  const qty = Math.trunc(Number(input.quantity));
  if (!(qty > 0) || qty > 1_000_000)
    return { ok: false, error: "Enter a whole quantity above 0." };
  if (input.fromLocationId === input.toLocationId)
    return { ok: false, error: "Pick two different stores." };

  const [from, to] = await Promise.all([
    prisma.location.findUnique({ where: { id: input.fromLocationId } }),
    prisma.location.findUnique({ where: { id: input.toLocationId } }),
  ]);
  if (!from || !to) return { ok: false, error: "Store not found." };

  try {
    await prisma.$transaction(async (tx) => {
      // take from source
      if (from.kind === "ONLINE") {
        const res = await tx.productVariant.updateMany({
          where: { id: input.variantId, stock: { gte: qty } },
          data: { stock: { decrement: qty } },
        });
        if (res.count === 0) throw new Error("Not enough stock at the source store.");
      } else {
        const res = await tx.inventoryLevel.updateMany({
          where: {
            locationId: from.id,
            variantId: input.variantId,
            quantity: { gte: qty },
          },
          data: { quantity: { decrement: qty } },
        });
        if (res.count === 0) throw new Error("Not enough stock at the source store.");
      }
      // add to destination
      if (to.kind === "ONLINE") {
        await tx.productVariant.update({
          where: { id: input.variantId },
          data: { stock: { increment: qty } },
        });
      } else {
        await tx.inventoryLevel.upsert({
          where: {
            locationId_variantId: { locationId: to.id, variantId: input.variantId },
          },
          update: { quantity: { increment: qty } },
          create: { locationId: to.id, variantId: input.variantId, quantity: qty },
        });
      }
    });
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Transfer failed." };
  }
  revalidatePath("/admin/stores/inventory");
  if (from.kind === "ONLINE" || to.kind === "ONLINE") {
    revalidatePath("/");
    revalidatePath("/shop");
  }
  return { ok: true };
}

/* ------------------------------- POS ------------------------------- */

export async function recordStoreSale(input: {
  locationId: string;
  paymentMethod: "CASH" | "BKASH" | "NAGAD" | "CARD";
  discount?: number;
  customerName?: string;
  customerPhone?: string;
  note?: string;
  items: { variantId: string; quantity: number }[];
}): Promise<Result> {
  const admin = await requireAdmin();

  const loc = await prisma.location.findUnique({ where: { id: input.locationId } });
  if (!loc || !loc.active) return { ok: false, error: "Pick an active store." };

  const lines = input.items
    .filter((i) => i.variantId && Number.isFinite(i.quantity))
    .map((i) => ({ variantId: i.variantId, quantity: Math.trunc(Number(i.quantity)) }))
    .filter((i) => i.quantity > 0 && i.quantity <= 100000);
  if (lines.length === 0) return { ok: false, error: "Add at least one item." };
  if (!["CASH", "BKASH", "NAGAD", "CARD"].includes(input.paymentMethod))
    return { ok: false, error: "Invalid payment method." };

  const variants = await prisma.productVariant.findMany({
    where: { id: { in: Array.from(new Set(lines.map((l) => l.variantId))) } },
    include: { product: true },
  });

  const resolved: {
    variantId: string;
    productName: string;
    size: string;
    unitPrice: number;
    unitCost: number;
    quantity: number;
  }[] = [];
  for (const l of lines) {
    const v = variants.find((x) => x.id === l.variantId);
    if (!v) return { ok: false, error: "A product is no longer available." };
    resolved.push({
      variantId: v.id,
      productName: v.product.name,
      size: v.size,
      unitPrice: v.product.price,
      unitCost: v.product.costPrice,
      quantity: l.quantity,
    });
  }

  const subtotal = resolved.reduce((n, r) => n + r.unitPrice * r.quantity, 0);
  const discount = Math.max(0, Math.round(input.discount || 0));
  const total = Math.max(0, subtotal - discount);
  const cost = resolved.reduce((n, r) => n + r.unitCost * r.quantity, 0);
  const isOnline = loc.kind === "ONLINE";

  let saleId = "";
  try {
    for (let attempt = 1; ; attempt++) {
      const number = generateSaleNumber();
      try {
        const created = await prisma.$transaction(async (tx) => {
          for (const r of resolved) {
            if (isOnline) {
              const res = await tx.productVariant.updateMany({
                where: { id: r.variantId, stock: { gte: r.quantity } },
                data: { stock: { decrement: r.quantity } },
              });
              if (res.count === 0)
                throw new Error(`${r.productName} (${r.size}) — not enough stock.`);
            } else {
              const res = await tx.inventoryLevel.updateMany({
                where: {
                  locationId: loc.id,
                  variantId: r.variantId,
                  quantity: { gte: r.quantity },
                },
                data: { quantity: { decrement: r.quantity } },
              });
              if (res.count === 0)
                throw new Error(
                  `${r.productName} (${r.size}) — not enough stock at ${loc.name}.`,
                );
            }
          }
          return tx.storeSale.create({
            data: {
              number,
              locationId: loc.id,
              soldById: admin.id,
              customerName: input.customerName?.trim() || null,
              customerPhone: input.customerPhone?.trim() || null,
              subtotal,
              discount,
              total,
              cost,
              paymentMethod: input.paymentMethod,
              note: input.note?.trim() || null,
              items: {
                create: resolved.map((r) => ({
                  variantId: r.variantId,
                  productName: r.productName,
                  size: r.size,
                  unitPrice: r.unitPrice,
                  unitCost: r.unitCost,
                  quantity: r.quantity,
                })),
              },
            },
          });
        });
        saleId = created.id;
        break;
      } catch (e) {
        const err = e as { code?: string; meta?: { target?: unknown } };
        if (
          err?.code === "P2002" &&
          String(err?.meta?.target ?? "").includes("number") &&
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
      error: e instanceof Error ? e.message : "Could not record the sale.",
    };
  }

  revalidatePath("/admin/stores");
  revalidatePath("/admin/stores/inventory");
  revalidatePath("/admin/stores/reports");
  revalidatePath("/admin");
  if (isOnline) {
    revalidatePath("/");
    revalidatePath("/shop");
  }
  return { ok: true, id: saleId };
}

/* ----------------------------- expenses ---------------------------- */

const EXPENSE_CATEGORIES = [
  "RENT",
  "SALARY",
  "UTILITIES",
  "MARKETING",
  "SUPPLIES",
  "LOGISTICS",
  "RESTOCK",
  "OTHER",
] as const;

export async function saveExpense(input: {
  id?: string;
  locationId?: string;
  category: string;
  amount: number;
  note?: string;
  incurredAt?: string;
}): Promise<Result> {
  await requireAdmin();
  const amount = Math.round(input.amount);
  if (!(amount > 0)) return { ok: false, error: "Enter an amount above 0." };
  const category = EXPENSE_CATEGORIES.includes(input.category as never)
    ? (input.category as (typeof EXPENSE_CATEGORIES)[number])
    : "OTHER";
  const incurredAt = input.incurredAt ? new Date(input.incurredAt) : new Date();
  if (Number.isNaN(incurredAt.getTime()))
    return { ok: false, error: "Invalid date." };

  const data = {
    locationId: input.locationId || null,
    category,
    amount,
    note: input.note?.trim() || null,
    incurredAt,
  };
  if (input.id) {
    await prisma.expense.update({ where: { id: input.id }, data });
  } else {
    await prisma.expense.create({ data });
  }
  revalidatePath("/admin/stores/expenses");
  revalidatePath("/admin/stores/reports");
  return { ok: true };
}

export async function deleteExpense(id: string): Promise<Result> {
  await requireAdmin();
  await prisma.expense.delete({ where: { id } });
  revalidatePath("/admin/stores/expenses");
  revalidatePath("/admin/stores/reports");
  return { ok: true };
}

export async function goToNewLocation() {
  await requireAdmin();
  redirect("/admin/stores/new");
}
