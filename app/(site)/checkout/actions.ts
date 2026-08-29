"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { checkoutSchema } from "@/lib/validators";
import { getSettings, calcShipping } from "@/lib/settings";
import { generateOrderNumber, parseImages } from "@/lib/utils";
import { RECENT_ORDERS_COOKIE } from "@/lib/orders";
import { checkDiscount } from "@/lib/discounts";

export type CheckoutState = {
  ok?: boolean;
  orderNumber?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

type RawItem = {
  productId: string;
  size: string;
  quantity: number;
  purchaseOption: "one-time" | "subscribe";
  frequencyWeeks?: number;
};

type RawInput = {
  customerName: string;
  phone: string;
  email: string;
  addressLine: string;
  area: string;
  city: string;
  note: string;
  paymentMethod: "COD" | "BKASH" | "NAGAD";
  transactionId: string;
  senderNumber: string;
  discountCode?: string;
  items: RawItem[];
};

export async function applyDiscount(
  code: string,
  subtotal: number,
): Promise<{ ok: true; amount: number; label: string } | { ok: false; error: string }> {
  const r = await checkDiscount(code, subtotal);
  return r.ok ? { ok: true, amount: r.amount, label: r.label } : { ok: false, error: r.error };
}

export async function placeOrder(input: RawInput): Promise<CheckoutState> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Please check the form.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;

  if (data.paymentMethod !== "COD") {
    if (!data.transactionId || data.transactionId.trim().length < 4) {
      return {
        error: "Enter the bKash/Nagad Transaction ID to confirm your payment.",
        fieldErrors: { transactionId: ["Transaction ID is required"] },
      };
    }
    if (!data.senderNumber || data.senderNumber.trim().length < 6) {
      return {
        error: "Enter the mobile number you paid from.",
        fieldErrors: { senderNumber: ["Sender number is required"] },
      };
    }
  }

  const user = await getCurrentUser();
  const settings = await getSettings();

  const productIds = Array.from(new Set(data.items.map((i) => i.productId)));
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, active: true },
    include: { variants: true },
  });

  type Line = {
    productId: string;
    productName: string;
    image: string;
    size: string;
    price: number;
    cost: number;
    quantity: number;
    variantId: string;
    purchaseOption: "one-time" | "subscribe";
    frequencyWeeks: number;
    subscribeUnitPrice: number;
  };
  const lineItems: Line[] = [];

  for (const item of data.items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) return { error: "One of the items is no longer available." };
    const variant = product.variants.find((v) => v.size === item.size);
    if (!variant) return { error: `${product.name} — ${item.size} is unavailable.` };
    if (variant.stock < item.quantity)
      return { error: `${product.name} (${item.size}) — only ${variant.stock} left in stock.` };

    const isSub = item.purchaseOption === "subscribe" && product.subscribePrice != null;
    lineItems.push({
      productId: product.id,
      productName: product.name,
      image: parseImages(product.images)[0] ?? "",
      size: item.size,
      price: isSub ? product.subscribePrice! : product.price,
      cost: product.costPrice,
      quantity: item.quantity,
      variantId: variant.id,
      purchaseOption: isSub ? "subscribe" : "one-time",
      frequencyWeeks: item.frequencyWeeks ?? 4,
      subscribeUnitPrice: product.subscribePrice ?? product.price,
    });
  }

  const subtotal = lineItems.reduce((n, li) => n + li.price * li.quantity, 0);
  const shipping = calcShipping(subtotal, data.city, settings);

  let discountId: string | null = null;
  let discountCode: string | null = null;
  let discountAmount = 0;
  if (data.discountCode && data.discountCode.trim()) {
    const dc = await checkDiscount(data.discountCode, subtotal);
    if (!dc.ok) return { error: dc.error, fieldErrors: { discountCode: [dc.error] } };
    discountId = dc.discount.id;
    discountCode = dc.discount.code;
    discountAmount = dc.amount;
  }

  const total = Math.max(0, subtotal - discountAmount) + shipping;
  const subLines = lineItems.filter((li) => li.purchaseOption === "subscribe");

  const createOrder = (orderNo: string) =>
    prisma.$transaction(async (tx) => {
      for (const li of lineItems) {
        const res = await tx.productVariant.updateMany({
          where: { id: li.variantId, stock: { gte: li.quantity } },
          data: { stock: { decrement: li.quantity } },
        });
        if (res.count === 0) throw new Error(`${li.productName} (${li.size}) just sold out.`);
      }

      if (discountId) {
        const d = await tx.discount.findUnique({ where: { id: discountId } });
        if (!d || !d.active || (d.maxUses != null && d.usedCount >= d.maxUses)) {
          throw new Error("That discount code was just used up.");
        }
        await tx.discount.update({ where: { id: discountId }, data: { usedCount: { increment: 1 } } });
      }

      const order = await tx.order.create({
        data: {
          orderNumber: orderNo,
          userId: user?.id ?? null,
          customerName: data.customerName,
          phone: data.phone,
          email: data.email || null,
          addressLine: data.addressLine,
          area: data.area,
          city: data.city,
          note: data.note || null,
          paymentMethod: data.paymentMethod,
          paymentStatus: data.paymentMethod === "COD" ? "UNPAID" : "PENDING_VERIFICATION",
          transactionId: data.transactionId || null,
          senderNumber: data.senderNumber || null,
          subtotal,
          discountId,
          discountCode,
          discountAmount,
          shipping,
          total,
          status: "PENDING",
          isSubscriptionSeed: subLines.length > 0,
          items: {
            create: lineItems.map((li) => ({
              productId: li.productId,
              productName: li.productName,
              image: li.image,
              size: li.size,
              price: li.price,
              cost: li.cost,
              quantity: li.quantity,
            })),
          },
          timeline: {
            create: [
              {
                label: "Order placed",
                note:
                  data.paymentMethod === "COD"
                    ? "Cash on Delivery"
                    : `${data.paymentMethod} payment submitted — awaiting verification`,
              },
            ],
          },
        },
      });

      // Open a Subscription for each subscribe line (admin fulfils manually).
      for (const li of subLines) {
        const nextShipAt = new Date();
        nextShipAt.setDate(nextShipAt.getDate() + li.frequencyWeeks * 7);
        await tx.subscription.create({
          data: {
            userId: user?.id ?? null,
            customerName: data.customerName,
            phone: data.phone,
            email: data.email || null,
            addressLine: data.addressLine,
            area: data.area,
            city: data.city,
            productId: li.productId,
            variantId: li.variantId,
            size: li.size,
            frequencyWeeks: li.frequencyWeeks,
            priceAtSignup: li.subscribeUnitPrice,
            nextShipAt,
            status: "ACTIVE",
            lastOrderId: order.id,
          },
        });
      }
    });

  let orderNumber = "";
  try {
    for (let attempt = 1; ; attempt++) {
      orderNumber = generateOrderNumber();
      try {
        await createOrder(orderNumber);
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
    return { error: e instanceof Error ? e.message : "Could not place the order. Try again." };
  }

  const jar = await cookies();
  const prev = (jar.get(RECENT_ORDERS_COOKIE)?.value ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  jar.set(RECENT_ORDERS_COOKIE, [orderNumber, ...prev].slice(0, 12).join(","), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  return { ok: true, orderNumber };
}
