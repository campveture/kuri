"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { slugify, generateSku, randomToken } from "@/lib/utils";
import { productSchema, categorySchema, adminUserSchema } from "@/lib/validators";
import { setSettings, SETTING_KEYS } from "@/lib/settings";

/* ----------------------------- products ----------------------------- */

type ProductInput = {
  id?: string;
  name: string;
  slug?: string;
  description: string;
  price: number | string;
  compareAtPrice?: number | string;
  costPrice?: number | string;
  subscribePrice?: number | string;
  categoryId: string;
  images: string[];
  tags?: string;
  featured: boolean;
  active: boolean;
  tastingNotes: string[];
  origin?: string;
  altitude?: string;
  process?: string;
  harvest?: string;
  brewTemp?: string;
  brewDose?: string;
  brewSteep?: string;
  brewBestWith?: string;
  accent: string;
  accentDark: string;
  variants: { size: string; stock: number | string }[];
};

export async function saveProduct(input: ProductInput) {
  await requireAdmin();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error: "Check the tea fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const d = parsed.data;
  const baseSlug = d.slug ? slugify(d.slug) : slugify(d.name);

  const clash = await prisma.product.findFirst({
    where: { slug: baseSlug, ...(input.id ? { id: { not: input.id } } : {}) },
    select: { id: true },
  });
  let slug = clash ? `${baseSlug}-${randomToken(4)}` : baseSlug;

  const buildData = (slugToUse: string) => ({
    name: d.name,
    slug: slugToUse,
    description: d.description,
    price: d.price,
    compareAtPrice: d.compareAtPrice || null,
    costPrice: d.costPrice ?? 0,
    subscribePrice: d.subscribePrice || null,
    categoryId: d.categoryId,
    images: JSON.stringify(d.images),
    tags: d.tags ?? "",
    featured: d.featured,
    active: d.active,
    tastingNotes: JSON.stringify(d.tastingNotes),
    origin: d.origin || null,
    altitude: d.altitude || null,
    process: d.process || null,
    harvest: d.harvest || null,
    brewTemp: d.brewTemp || null,
    brewDose: d.brewDose || null,
    brewSteep: d.brewSteep || null,
    brewBestWith: d.brewBestWith || null,
    accent: d.accent,
    accentDark: d.accentDark,
  });

  async function persist(slugToUse: string): Promise<string> {
    if (input.id) {
      await prisma.product.update({
        where: { id: input.id },
        data: buildData(slugToUse),
      });
      const existing = await prisma.productVariant.findMany({
        where: { productId: input.id },
      });
      await prisma.productVariant.deleteMany({
        where: {
          productId: input.id,
          size: { notIn: d.variants.map((v) => v.size) },
        },
      });
      for (const v of d.variants) {
        const found = existing.find((e) => e.size === v.size);
        if (found) {
          await prisma.productVariant.update({
            where: { id: found.id },
            data: { stock: v.stock },
          });
        } else {
          await prisma.productVariant.create({
            data: {
              productId: input.id,
              size: v.size,
              stock: v.stock,
              sku: generateSku(v.size),
            },
          });
        }
      }
      return input.id;
    }
    const created = await prisma.product.create({
      data: {
        ...buildData(slugToUse),
        variants: {
          create: d.variants.map((v) => ({
            size: v.size,
            stock: v.stock,
            sku: generateSku(v.size),
          })),
        },
      },
    });
    return created.id;
  }

  let productId: string;
  try {
    productId = await persist(slug);
  } catch (e) {
    const err = e as { code?: string; meta?: { target?: unknown } };
    if (err?.code === "P2002" && String(err?.meta?.target ?? "").includes("slug")) {
      slug = `${baseSlug}-${randomToken(5)}`;
      productId = await persist(slug);
    } else {
      return { error: "Could not save the tea. Try again." };
    }
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
  if (productId) revalidatePath(`/shop/${slug}`);
  return { ok: true, id: productId };
}

export async function toggleProductActive(id: string, active: boolean) {
  await requireAdmin();
  await prisma.product.update({ where: { id }, data: { active } });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { ok: true };
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  const orderCount = await prisma.orderItem.count({ where: { productId: id } });
  if (orderCount > 0) {
    await prisma.product.update({ where: { id }, data: { active: false } });
    revalidatePath("/admin/products");
    return { ok: true, softDeleted: true };
  }
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { ok: true };
}

/* ---------------------------- categories ---------------------------- */

export async function saveCategory(_prev: unknown, formData: FormData) {
  await requireAdmin();
  const id = (formData.get("id") as string) || "";
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    image: formData.get("image"),
  });
  if (!parsed.success) return { error: "Enter a category name." };
  const d = parsed.data;
  const slug = d.slug ? slugify(d.slug) : slugify(d.name);
  const image = d.image?.trim() || null;

  if (id) {
    await prisma.category.update({
      where: { id },
      data: { name: d.name, slug, description: d.description || null, image },
    });
  } else {
    const count = await prisma.category.count();
    await prisma.category.create({
      data: {
        name: d.name,
        slug,
        description: d.description || null,
        image,
        position: count,
      },
    });
  }
  revalidatePath("/admin/categories");
  revalidatePath("/");
  revalidatePath("/shop");
  return { ok: true };
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  const count = await prisma.product.count({ where: { categoryId: id } });
  if (count > 0)
    return { error: `Move or delete the ${count} tea(s) in this category first.` };
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  return { ok: true };
}

/* ------------------------------ orders ------------------------------ */

const STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

export async function updateOrderStatus(
  orderId: string,
  status: (typeof STATUSES)[number],
  note?: string,
) {
  await requireAdmin();
  if (!STATUSES.includes(status)) return { error: "Invalid status." };

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return { error: "Order not found." };
  if (order.status === status) return { ok: true };

  const goingToCancelled = status === "CANCELLED" && order.status !== "CANCELLED";
  const leavingCancelled = order.status === "CANCELLED" && status !== "CANCELLED";

  try {
    await prisma.$transaction(async (tx) => {
      if (goingToCancelled) {
        for (const item of order.items) {
          if (!item.productId) continue;
          await tx.productVariant.updateMany({
            where: { productId: item.productId, size: item.size },
            data: { stock: { increment: item.quantity } },
          });
        }
      }
      if (leavingCancelled) {
        for (const item of order.items) {
          if (!item.productId) continue;
          const res = await tx.productVariant.updateMany({
            where: {
              productId: item.productId,
              size: item.size,
              stock: { gte: item.quantity },
            },
            data: { stock: { decrement: item.quantity } },
          });
          if (res.count === 0) {
            throw new Error(
              `Can't reopen — not enough stock for ${item.productName} (${item.size}).`,
            );
          }
        }
      }

      await tx.order.update({
        where: { id: orderId },
        data: {
          status,
          timeline: {
            create: {
              label: `Status → ${status.charAt(0) + status.slice(1).toLowerCase()}`,
              note: note || null,
            },
          },
        },
      });
    });
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Could not update the order status.",
    };
  }

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  revalidatePath("/shop");
  return { ok: true };
}

export async function setPaymentStatus(
  orderId: string,
  paymentStatus: "UNPAID" | "PENDING_VERIFICATION" | "PAID" | "REFUNDED",
) {
  await requireAdmin();
  await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus,
      timeline: {
        create: {
          label: `Payment → ${paymentStatus.replace(/_/g, " ").toLowerCase()}`,
        },
      },
    },
  });
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return { ok: true };
}

export async function addOrderNote(orderId: string, note: string) {
  await requireAdmin();
  if (!note.trim()) return { error: "Empty note." };
  await prisma.order.update({
    where: { id: orderId },
    data: { timeline: { create: { label: "Note", note: note.trim() } } },
  });
  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true };
}

export async function setFulfillment(
  orderId: string,
  courier: string,
  trackingCode: string,
) {
  await requireAdmin();
  const c = courier.trim().slice(0, 60) || null;
  const t = trackingCode.trim().slice(0, 60) || null;
  await prisma.order.update({
    where: { id: orderId },
    data: {
      courier: c,
      trackingCode: t,
      timeline: {
        create: {
          label: "Shipment details",
          note: [c, t && `tracking ${t}`].filter(Boolean).join(" · ") || "cleared",
        },
      },
    },
  });
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return { ok: true };
}

/* ----------------------------- settings ----------------------------- */

export async function saveSettings(_prev: unknown, formData: FormData) {
  await requireAdmin();
  const updates: Record<string, string> = {};
  for (const key of SETTING_KEYS) {
    const v = formData.get(key);
    if (typeof v === "string") updates[key] = v;
  }
  updates["show_new_arrivals"] =
    formData.get("show_new_arrivals") === "true" ? "true" : "false";
  await setSettings(updates);
  revalidatePath("/", "layout");
  return { ok: true, message: "Settings saved." };
}

/* --------------------------- staff / roles ------------------------- */

export async function setUserRole(userId: string, role: "CUSTOMER" | "ADMIN") {
  const me = await requireAdmin();
  if (me.id === userId) return { error: "You can't change your own role." };
  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/customers");
  return { ok: true };
}

export async function createUser(_prev: unknown, formData: FormData) {
  await requireAdmin();
  const parsed = adminUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return {
      error: "Check the fields below.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const d = parsed.data;
  const email = d.email.trim().toLowerCase();
  const clash = await prisma.user.findUnique({ where: { email } });
  if (clash) return { error: "A user with that email already exists." };

  await prisma.user.create({
    data: {
      name: d.name.trim(),
      email,
      phone: d.phone?.trim() || null,
      passwordHash: await bcrypt.hash(d.password, 10),
      role: d.role,
    },
  });
  revalidatePath("/admin/customers");
  return {
    ok: true,
    message: `${d.role === "ADMIN" ? "Admin" : "Customer"} account created.`,
  };
}

export async function createProductAndEdit() {
  await requireAdmin();
  redirect("/admin/products/new");
}
