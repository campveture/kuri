import { prisma } from "@/lib/prisma";
import type { OrderItem, OrderEvent } from "@prisma/client";

/** httpOnly cookie holding order numbers this browser placed (guest receipts). */
export const RECENT_ORDERS_COOKIE = "kuri_orders";

/** Shape the storefront order-detail component renders. */
export type OrderView = {
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  transactionId: string | null;
  senderNumber: string | null;
  customerName: string;
  phone: string;
  email: string | null;
  addressLine: string;
  area: string;
  city: string;
  note: string | null;
  subtotal: number;
  discountCode: string | null;
  discountAmount: number;
  shipping: number;
  total: number;
  courier: string | null;
  trackingCode: string | null;
  createdAt: Date;
  items: OrderItem[];
  timeline: OrderEvent[];
};

const include = {
  items: true,
  timeline: { orderBy: { createdAt: "asc" } },
} as const;

type OrderWithRelations = {
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  transactionId: string | null;
  senderNumber: string | null;
  customerName: string;
  phone: string;
  email: string | null;
  addressLine: string;
  area: string;
  city: string;
  note: string | null;
  subtotal: number;
  discountCode: string | null;
  discountAmount: number;
  shipping: number;
  total: number;
  courier: string | null;
  trackingCode: string | null;
  createdAt: Date;
  items: OrderItem[];
  timeline: OrderEvent[];
};

function toView(o: OrderWithRelations): OrderView {
  return {
    orderNumber: o.orderNumber,
    status: o.status,
    paymentMethod: o.paymentMethod,
    paymentStatus: o.paymentStatus,
    transactionId: o.transactionId,
    senderNumber: o.senderNumber,
    customerName: o.customerName,
    phone: o.phone,
    email: o.email,
    addressLine: o.addressLine,
    area: o.area,
    city: o.city,
    note: o.note,
    subtotal: o.subtotal,
    discountCode: o.discountCode,
    discountAmount: o.discountAmount,
    shipping: o.shipping,
    total: o.total,
    courier: o.courier,
    trackingCode: o.trackingCode,
    createdAt: o.createdAt,
    items: o.items,
    timeline: o.timeline,
  };
}

const normalizePhone = (p: string) => p.replace(/\D/g, "");

export async function getOrderByNumber(orderNumber: string) {
  const o = await prisma.order.findUnique({
    where: { orderNumber: orderNumber.trim().toUpperCase() },
    include,
  });
  return o ? toView(o) : null;
}

export async function getOrderForUser(orderNumber: string, userId: string) {
  const o = await prisma.order.findFirst({
    where: { orderNumber: orderNumber.trim().toUpperCase(), userId },
    include,
  });
  return o ? toView(o) : null;
}

/**
 * Public order lookup. Requires the phone used at checkout — compared as a
 * digits-only match on at least the last 6 digits, in application code (not a
 * loose SQL `contains`).
 */
export async function findOrderByNumberAndPhone(
  orderNumber: string,
  phone: string,
) {
  const input = normalizePhone(phone);
  if (input.length < 6) return null;

  const o = await prisma.order.findUnique({
    where: { orderNumber: orderNumber.trim().toUpperCase() },
    include,
  });
  if (!o) return null;

  const stored = normalizePhone(o.phone);
  const matches =
    stored === input ||
    (input.length >= 6 && stored.endsWith(input)) ||
    (stored.length >= 6 && input.endsWith(stored));
  return matches ? toView(o) : null;
}
