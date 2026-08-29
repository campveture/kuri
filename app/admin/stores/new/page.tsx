import Link from "next/link";
import { LocationForm } from "@/components/admin/location-form";

export const metadata = { title: "New store" };

export default function NewStorePage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/stores" className="text-xs text-muted-2 hover:text-gold-deep">
          ← Stores
        </Link>
        <h1 className="h-display mt-1 text-3xl">New store</h1>
        <p className="mt-1 text-sm text-muted-2">
          Add a physical outlet. Stock it from the Inventory screen, then record
          its sales.
        </p>
      </div>
      <LocationForm />
    </div>
  );
}
