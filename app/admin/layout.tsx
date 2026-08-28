import { AdminLayout } from "@/components/admin/AdminLayout";
import "./admin.css";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
