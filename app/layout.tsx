import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "ميت غمر أسفل كوبرى زفتى — رأيك يهمنا",
  description:
    "رأيك يهمنا في ميت غمر أسفل كوبرى زفتى. شوف تقييمات الزوار وشارك تجربتك.",
};

function Logo({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <img
      src="/logo.jpg"
      alt="شعار ميت غمر"
      className={`${className} rounded-full object-cover ring-2 ring-laguna/60`}
    />
  );
}

function SiteHeader() {
  return (
    <header className="border-b border-sand-200/70 bg-sand-50/90 sticky top-0 z-50 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <Logo />
          <span className="font-display text-lg font-semibold tracking-tight text-laguna-deep sm:text-xl">
            ميت غمر
          </span>
        </Link>
        <div className="flex items-center gap-1 rounded-full bg-sand-100 p-1 text-sm">
          <Link
            href="/"
            className="rounded-full px-4 py-1.5 font-medium text-ink-700 transition-colors hover:bg-white"
          >
            الرئيسية
          </Link>
          <Link
            href="/reviews"
            className="rounded-full px-4 py-1.5 font-medium text-ink-700 transition-colors hover:bg-white"
          >
            التقييمات
          </Link>
        </div>
      </nav>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-sand-200 py-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 text-center sm:px-6">
        <Logo className="h-14 w-14" />
        <p className="font-display text-lg text-laguna-deep">
          ميت غمر أسفل كوبرى زفتى
        </p>
        <p className="text-sm text-ink-500">رأيك يهمنا.</p>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${inter.variable} ${fraunces.variable}`}>
        <SiteHeader />
        <main className="min-h-[70vh]">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}