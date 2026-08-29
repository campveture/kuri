import type { Metadata } from "next";
import { Newsreader, Manrope } from "next/font/google";
import "./globals.css";

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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://kuri.vercel.app",
  ),
  title: "Kuri — Single-Origin Tea from Sreemangal, Bangladesh",
  description:
    "Kuri Valley Estate grows single-origin tea in the hills of Sreemangal, Bangladesh. One garden, one team, no blending.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${newsreader.variable} ${manrope.variable}`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
