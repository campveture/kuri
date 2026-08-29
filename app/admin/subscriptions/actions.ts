"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { generateOrderNumber, parseImages } from "@/lib/utils";
import { subscriptionSchema } from "@/lib/validators";

/**
 * Generate the next Order from a subscription, decrement stock, and roll the
 * schedule forward from the *scheduled* ship date (not "now").
 */
export async function advanceSubscription(id: string) {
  await requireAdmin();

  const sub = await prisma.subscription.findUnique({
    where: { id },
    include: { product: { include: { variants: true } } },
  });
  if (!sub) return { error: "Subscription not found." };
  if (sub.status === "CANCELLED")
    return { error: "This subscription is cancelled." };

  const product = sub.product;

  // Resolve the variant: prefer the stored variantId, else match by size.
  const variant = sub.variantId
    ? product.variants.find((v) => v.id === sub.variantId)
    : product.variants.find((v) => v.size === sub.size);
  if (!variant)
    return { error: "The tea weight for this subscription no longer exists." };
  const variantId = variant.id;

  const price = sub.priceAtSignup;
  const image = parseImages(product.images)[0] ?? "";

  // Advance from the scheduled date, not from now().
  const nextShipAt = new Date(sub.nextShipAt);
  nextShipAt.setDate(nextShipAt.getDate() + sub.frequencyWeeks * 7);

  const run = (orderNo: string) =>
    prisma.$transaction(async (tx) => {
      const dec = await tx.productVariant.updateMany({
        where: { id: variantId, stock: { gte: 1 } },
        data: { stock: { decrement: 1 } },
      });
      if (dec.count === 0) throw new Error("Out of stock");

      const order = await tx.order.create({
        data: {
          orderNumber: orderNo,
          userId: sub.userId,
          customerName: sub.customerName,
          phone: sub.phone,
          email: sub.email,
          addressLine: sub.addressLine,
          area: sub.area,
          city: sub.city,
          paymentMethod: "COD",
          paymentStatus: "UNPAID",
          subtotal: price,
          shipping: 0,
          total: price,
          status: "PENDING",
          source: "subscription",
          subscriptionId: id,
          isSubscriptionSeed: false,
          items: {
            create: [
              {
                productId: product.id,
                productName: product.name,
                image,
                size: sub.size,
                price,
                cost: product.costPrice,
                quantity: 1,
              },
            ],
          },
          timeline: {
            create: [{ label: "Subscription order generated" }],
          },
        },
      });

      await tx.subscription.update({
        where: { id },
        data: { nextShipAt, lastOrderId: order.id },
      });

      return order.orderNumber;
    });

  let orderNumber = "";
  try {
    for (let attempt = 1; ; attempt++) {
      const candidate = generateOrderNumber();
      try {
        orderNumber = await run(candidate);
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
      error: e instanceof Error ? e.message : "Could not generate the order.",
    };
  }

  revalidatePath("/admin/subscriptions");
  revalidatePath("/admin/subscriptions/" + id);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  return { ok: true, orderNumber };
}

export async function pauseSubscription(id: string) {
  await requireAdmin();
  await prisma.subscription.update({ where: { id }, data: { status: "PAUSED" } });
  revalidatePath("/admin/subscriptions");
  revalidatePath("/admin/subscriptions/" + id);
  return { ok: true };
}

export async function resumeSubscription(id: string) {
  await requireAdmin();
  const sub = await prisma.subscription.findUnique({ where: { id } });
  if (!sub) return { error: "Subscription not found." };

  const nextShipAt = new Date(sub.nextShipAt);
  const now = new Date();
  if (nextShipAt.getTime() <= now.getTime()) {
    const stepDays = sub.frequencyWeeks * 7;
    while (nextShipAt.getTime() <= now.getTime()) {
      nextShipAt.setDate(nextShipAt.getDate() + stepDays);
    }
  }

  await prisma.subscription.update({
    where: { id },
    data: { status: "ACTIVE", nextShipAt },
  });
  revalidatePath("/admin/subscriptions");
  revalidatePath("/admin/subscriptions/" + id);
  return { ok: true };
}

export async function cancelSubscription(id: string) {
  await requireAdmin();
  await prisma.subscription.update({
    where: { id },
    data: { status: "CANCELLED" },
  });
  revalidatePath("/admin/subscriptions");
  revalidatePath("/admin/subscriptions/" + id);
  return { ok: true };
}

type UpdateSubInput = {
  frequencyWeeks: number | string;
  nextShipAt: string;
  variantId?: string;
};

export async function updateSubscription(id: string, input: UpdateSubInput) {
  await requireAdmin();

  const parsed = subscriptionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error: "Check the schedule fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const d = parsed.data;

  const data: {
    frequencyWeeks: number;
    nextShipAt: Date;
    variantId?: string;
    size?: string;
  } = {
    frequencyWeeks: d.frequencyWeeks,
    nextShipAt: new Date(d.nextShipAt),
  };

  if (d.variantId) {
    const variant = await prisma.productVariant.findUnique({
      where: { id: d.variantId },
    });
    if (!variant) return { error: "That tea weight no longer exists." };
    data.variantId = variant.id;
    data.size = variant.size;
  }

  await prisma.subscription.update({ where: { id }, data });

  revalidatePath("/admin/subscriptions");
  revalidatePath("/admin/subscriptions/" + id);
  return { ok: true };
}
