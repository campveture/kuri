import type { Metadata } from "next";
import { Newsreader, Manrope } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartContext";
import { SiteChrome } from "@/components/SiteChrome";
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
          <SiteChrome>{children}</SiteChrome>
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
