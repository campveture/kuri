import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getOrderByNumber, getOrderForUser, RECENT_ORDERS_COOKIE } from "@/lib/orders";
import { OrderDetail } from "@/components/shop/order-detail";

export const metadata: Metadata = {
  title: "Order confirmed — Kuri",
  robots: { index: false, follow: false },
};

export default async function OrderPage(props: PageProps<"/order/[orderNumber]">) {
  const { orderNumber: raw } = await props.params;
  const orderNumber = decodeURIComponent(raw).trim().toUpperCase();

  const user = await getCurrentUser();
  let order = user ? await getOrderForUser(orderNumber, user.id) : null;

  if (!order) {
    const existing = await getOrderByNumber(orderNumber);
    if (!existing) notFound();

    const jar = await cookies();
    const recent = (jar.get(RECENT_ORDERS_COOKIE)?.value ?? "")
      .split(",")
      .map((s) => s.trim());

    if (recent.includes(orderNumber)) {
      order = existing;
    } else {
      redirect(`/track?order=${encodeURIComponent(orderNumber)}`);
    }
  }

  return (
    <div className="wrap py-12 md:py-16">
      <OrderDetail order={order} showBanner />
    </div>
  );
}
