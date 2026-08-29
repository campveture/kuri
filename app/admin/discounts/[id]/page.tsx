import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DiscountForm } from "@/components/admin/discount-form";

export const metadata = { title: "Edit discount" };

const toDateInput = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : "");

export default async function EditDiscountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const d = await prisma.discount.findUnique({ where: { id } });
  if (!d) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/admin/discounts"
        className="text-xs uppercase tracking-[0.12em] text-muted-2 hover:text-gold-deep"
      >
        ← Discounts
      </Link>
      <h1 className="h-display text-3xl">{d.code}</h1>
      <DiscountForm
        initial={{
          id: d.id,
          code: d.code,
          type: d.type,
          value: String(d.value),
          minSubtotal: String(d.minSubtotal),
          maxUses: d.maxUses != null ? String(d.maxUses) : "",
          startsAt: toDateInput(d.startsAt),
          endsAt: toDateInput(d.endsAt),
          active: d.active,
        }}
      />
    </div>
  );
}
