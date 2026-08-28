import { AdminShell } from "@/components/admin/AdminLayout";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
