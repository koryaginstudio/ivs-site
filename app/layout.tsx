import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { CookieBanner } from "@/components/CookieBanner";
import { Preloader } from "@/components/Preloader";
import "./globals.css";

// Дизайн-система ИВС-СЕТИ: только Inter в разных начертаниях.
const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--f-inter", display: "swap" });

export const metadata: Metadata = {
  // title/description повторяют живой ivs-corp.ru - единая выдача в поиске и шеринге
  title: "Компания «ИВС» — полный комплекс ИТ-услуг",
  description:
    "Более 10 направлений деятельности в сфере информационных технологий, множество реализованных проектов, внедрение комплексных решений для предприятий различных отраслей",
  // favicon.ico и apple-icon.png лежат в app/ и подхватываются автоматически, собраны из актуального знака
  icons: { icon: [{ url: "/ivs-mark-v2.svg", type: "image/svg+xml" }, { url: "/favicon.ico", sizes: "48x48" }] },
  robots: { index: false, follow: false }, // до запуска на боевом домене
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={inter.variable} suppressHydrationWarning>
      <body id="page-top" tabIndex={-1}>
        <Preloader />
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
