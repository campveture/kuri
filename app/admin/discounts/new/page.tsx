import Link from "next/link";
import { DiscountForm } from "@/components/admin/discount-form";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "New discount" };

export default async function NewDiscountPage() {
  await requireAdmin();
  return (
    <div className="space-y-6">
      <Link
        href="/admin/discounts"
        className="text-xs uppercase tracking-[0.12em] text-muted-2 hover:text-gold-deep"
      >
        ← Discounts
      </Link>
      <h1 className="h-display text-3xl">New discount</h1>
      <DiscountForm />
    </div>
  );
}
