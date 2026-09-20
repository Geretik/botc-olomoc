import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import { LanguageSwitch } from "@/components/language-switch";
import { getDict } from "@/i18n/server";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDict();
  return { title: t.meta.title, description: t.meta.description };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { locale, t } = await getDict();
  return (
    <html lang={locale} className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <header className="border-b border-border">
          <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between gap-4">
            <Link href="/" className="font-semibold tracking-tight text-lg">
              🕰️ Blood on the Clocktower <span className="text-muted">Olomouc</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/" className="hover:underline">{t.nav.sessions}</Link>
              <Link href="/o-hre" className="hover:underline">{t.nav.about}</Link>
              <LanguageSwitch locale={locale} t={t} />
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-3xl px-4 py-8 flex-1">
          {children}
        </main>
        <footer className="border-t border-border">
          <div className="mx-auto max-w-3xl px-4 py-4 text-sm text-muted flex justify-between">
            <span>{t.nav.footer}</span>
            <Link href="/admin" className="hover:underline">
              {t.nav.admin}
            </Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
