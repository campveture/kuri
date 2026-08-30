import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LocationForm } from "@/components/admin/location-form";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Edit store" };

export default async function EditStorePage(props: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await props.params;
  const loc = await prisma.location.findUnique({ where: { id } });
  if (!loc || loc.kind === "ONLINE") notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/stores" className="text-xs text-muted-2 hover:text-gold-deep">
          ← Stores
        </Link>
        <h1 className="h-display mt-1 text-3xl">{loc.name}</h1>
      </div>
      <LocationForm
        initial={{
          id: loc.id,
          name: loc.name,
          slug: loc.slug,
          address: loc.address,
          phone: loc.phone,
          active: loc.active,
        }}
      />
    </div>
  );
}
