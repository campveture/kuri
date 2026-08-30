import { getSettings } from "@/lib/settings";
import { getCollections } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { SettingsForm } from "@/components/admin/settings-form";
import { ChangePasswordForm } from "@/components/account/change-password-form";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  await requireAdmin();
  const [s, collections, user] = await Promise.all([
    getSettings(),
    getCollections(),
    getCurrentUser(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="h-display text-3xl">Store settings</h1>
        <SettingsForm
          settings={s}
          collections={collections.map((c) => ({ name: c.name, slug: c.slug }))}
        />
      </div>

      <div className="max-w-md">
        <h2 className="h-display text-2xl">Your account</h2>
        <p className="mt-1 text-sm text-muted-2">
          Signed in as {user?.email}. Change your admin password below.
        </p>
        <div className="mt-4">
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
