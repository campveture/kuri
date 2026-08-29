import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { signOut } from "@/app/(auth)/actions";
import { AdminNav } from "@/components/admin/admin-nav";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Kuri Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const admin = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-cream text-charcoal">
      <aside className="admin-sidebar sticky top-0 hidden h-screen w-[244px] shrink-0 flex-col lg:flex">
        <div className="border-b border-[color:rgba(247,242,230,0.12)] px-5 py-4">
          <Link href="/admin" className="font-serif text-lg text-cream">
            Kuri
          </Link>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[color:rgba(247,242,230,0.5)]">
            Admin
          </p>
        </div>
        <div className="flex-1 overflow-y-auto">
          <AdminNav />
        </div>
        <div className="border-t border-[color:rgba(247,242,230,0.12)] p-4">
          <p className="mb-2 truncate text-xs text-[color:rgba(247,242,230,0.6)]">
            {admin.email}
          </p>
          <form action={signOut}>
            <button className="btn btn-sm w-full border border-[color:rgba(247,242,230,0.25)] text-cream">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-line bg-charcoal px-5 py-3 text-cream lg:hidden">
          <Link href="/admin" className="font-serif text-base">
            Kuri Admin
          </Link>
          <form action={signOut}>
            <button className="text-xs uppercase tracking-wide text-[color:rgba(247,242,230,0.7)]">
              Sign out
            </button>
          </form>
        </header>
        <div className="lg:hidden">
          <AdminNav horizontal />
        </div>
        <main className="min-w-0 flex-1 p-5 sm:p-8">{children}</main>
      </div>
      <Toaster />
    </div>
  );
}
