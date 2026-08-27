import type { Metadata } from "next";
import { Newsreader, Manrope } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartContext";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kuri — Single-Origin Tea from Sreemangal, Bangladesh",
  description:
    "Kuri Valley Estate grows single-origin tea in the hills of Sreemangal, Bangladesh. One garden, one team, no blending.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${newsreader.variable} ${manrope.variable}`}>
      <body className="min-h-screen">
        <CartProvider>
          <div className="flex min-h-screen flex-col overflow-x-hidden">
            <div className="bg-charcoal py-2.5 text-center text-xs tracking-wide text-cream">
              Free shipping on orders over ৳[AMOUNT] &middot; Shipped fresh from Sreemangal
            </div>
            <Nav />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
