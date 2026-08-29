import Link from "next/link";
import { UserCreateForm } from "@/components/admin/user-create-form";

export const metadata = { title: "New user" };

export default function NewUserPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/customers"
          className="text-xs uppercase tracking-[0.12em] text-muted-2 hover:text-gold-deep"
        >
          ← Customers
        </Link>
        <h1 className="h-display mt-1 text-3xl">Add a user</h1>
        <p className="mt-1 text-sm text-muted-2">
          Create a customer account, or an admin who can run this panel.
        </p>
      </div>
      <UserCreateForm />
    </div>
  );
}
