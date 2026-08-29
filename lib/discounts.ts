import { prisma } from "@/lib/prisma";
import type { Discount } from "@prisma/client";

export type DiscountCheck =
  | { ok: true; discount: Discount; amount: number; label: string }
  | { ok: false; error: string };

/** Compute the taka discount for a code against a subtotal. Pure validation —
 *  does not consume a use. */
export async function checkDiscount(
  rawCode: string,
  subtotal: number,
): Promise<DiscountCheck> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { ok: false, error: "Enter a code." };

  const d = await prisma.discount.findUnique({ where: { code } });
  if (!d || !d.active) return { ok: false, error: "That code isn't valid." };

  const now = new Date();
  if (d.startsAt && d.startsAt > now)
    return { ok: false, error: "That code isn't active yet." };
  if (d.endsAt && d.endsAt < now)
    return { ok: false, error: "That code has expired." };
  if (d.maxUses != null && d.usedCount >= d.maxUses)
    return { ok: false, error: "That code has been fully used." };
  if (subtotal < d.minSubtotal)
    return {
      ok: false,
      error: `Spend at least ৳${d.minSubtotal.toLocaleString("en-BD")} to use this code.`,
    };

  const amount =
    d.type === "PERCENT"
      ? Math.round((subtotal * Math.min(d.value, 100)) / 100)
      : Math.min(d.value, subtotal);

  const label =
    d.type === "PERCENT" ? `${d.value}% off` : `৳${d.value.toLocaleString("en-BD")} off`;

  return { ok: true, discount: d, amount, label };
}
