import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { prisma } from "@/lib/prisma";
import { CheckoutForm } from "@/components/shop/checkout-form";

export const metadata: Metadata = { title: "Checkout — Kuri" };

export default async function CheckoutPage() {
  const [user, settings] = await Promise.all([getCurrentUser(), getSettings()]);

  let defaultAddress = null;
  if (user) {
    defaultAddress = await prisma.address.findFirst({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
  }

  return (
    <div className="wrap py-12 md:py-16">
      <h1 className="font-serif text-[32px] font-medium sm:text-4xl">Checkout</h1>
      <p className="mt-2 text-sm text-muted">
        Cash on Delivery available nationwide. bKash / Nagad accepted.
      </p>
      <CheckoutForm
        settings={{
          bkashNumber: settings.bkashNumber,
          bkashType: settings.bkashType,
          nagadNumber: settings.nagadNumber,
          nagadType: settings.nagadType,
          shippingInsideDhaka: settings.shippingInsideDhaka,
          shippingOutsideDhaka: settings.shippingOutsideDhaka,
          freeShippingThreshold: settings.freeShippingThreshold,
        }}
        prefill={{
          customerName: defaultAddress?.fullName ?? user?.name ?? "",
          phone: defaultAddress?.phone ?? user?.phone ?? "",
          email: user?.email ?? "",
          addressLine: defaultAddress?.line1 ?? "",
          area: defaultAddress?.area ?? "",
          city: defaultAddress?.city ?? "Dhaka",
        }}
      />
    </div>
  );
}
