import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Дизайн-система ИВС-СЕТИ: только Inter в разных начертаниях.
const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--f-inter", display: "swap" });

export const metadata: Metadata = {
  title: "ИВС-СЕТИ — системный интегратор",
  description: "Полный комплекс ИТ-услуг для бизнеса и госсектора: сети, ЦОД, информационная безопасность, разработка ПО, техподдержка.",
  icons: { icon: "/ivs-favicon.svg" },
  robots: { index: false, follow: false }, // до запуска на боевом домене
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={inter.variable} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
