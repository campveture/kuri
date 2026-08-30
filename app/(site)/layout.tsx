import { CartProvider } from "@/components/CartContext";
import { SiteChrome } from "@/components/SiteChrome";
import { CartDrawer } from "@/components/CartDrawer";
import { getSettings } from "@/lib/settings";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const settings = await getSettings();
  return (
    <CartProvider>
      <SiteChrome announcement={settings.announcement}>{children}</SiteChrome>
      <CartDrawer />
    </CartProvider>
  );
}
