import { CartProvider } from "@/components/CartContext";
import { SiteChrome } from "@/components/SiteChrome";
import { CartDrawer } from "@/components/CartDrawer";
import { Toaster } from "@/components/ui/toaster";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <CartProvider>
      <SiteChrome>{children}</SiteChrome>
      <CartDrawer />
      <Toaster />
    </CartProvider>
  );
}
