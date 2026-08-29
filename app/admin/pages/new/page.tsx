import Link from "next/link";
import { NewPageForm } from "@/components/admin/new-page-form";

export const metadata = { title: "New page" };

export default function NewAdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/pages"
          className="text-xs uppercase tracking-[0.12em] text-muted-2 hover:text-gold-deep"
        >
          ← Pages
        </Link>
        <h1 className="h-display mt-1 text-3xl">New page</h1>
      </div>
      <NewPageForm />
    </div>
  );
}
