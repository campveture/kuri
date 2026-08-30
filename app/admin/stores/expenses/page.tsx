import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ExpenseManager } from "@/components/admin/expense-manager";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Expenses" };

export default async function ExpensesPage() {
  await requireAdmin();
  const [locations, rows] = await Promise.all([
    prisma.location.findMany({
      where: { kind: "STORE" },
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
      select: { id: true, name: true },
    }),
    prisma.expense.findMany({
      orderBy: { incurredAt: "desc" },
      take: 200,
      include: { location: { select: { name: true } } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/stores" className="text-xs text-muted-2 hover:text-gold-deep">
          ← Stores
        </Link>
        <h1 className="h-display mt-1 text-3xl">Expenses</h1>
        <p className="mt-1 text-sm text-muted-2">
          Rent, salaries, marketing, restock costs — anything that eats into
          profit. Tag to a store or leave company-wide.
        </p>
      </div>
      <ExpenseManager
        locations={locations}
        expenses={rows.map((e) => ({
          id: e.id,
          category: e.category,
          amount: e.amount,
          note: e.note,
          incurredAt: e.incurredAt.toISOString(),
          locationName: e.location?.name ?? null,
        }))}
      />
    </div>
  );
}
