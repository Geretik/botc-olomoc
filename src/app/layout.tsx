import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import { LanguageSwitch } from "@/components/language-switch";
import { getDict } from "@/i18n/server";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getDict();
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: t.meta.title, template: `%s` },
    description: t.meta.description,
    openGraph: {
      siteName: t.meta.title,
      title: t.meta.title,
      description: t.meta.description,
      type: "website",
      locale: locale === "cs" ? "cs_CZ" : "en_GB",
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { locale, t } = await getDict();
  return (
    <html lang={locale} className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <header className="border-b border-border">
          <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between gap-4">
            <Link href="/" className="font-semibold tracking-tight text-lg">
              🕰️ {t.meta.title}
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/" className="hover:underline">{t.nav.sessions}</Link>
              <Link href="/o-hre" className="hover:underline">{t.nav.about}</Link>
              <Link href="/archiv" className="hover:underline">{t.nav.archive}</Link>
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
            <span className="flex gap-4">
              <a href="/kalendar.ics" className="hover:underline">{t.nav.calendarFeed}</a>
              <Link href="/admin" className="hover:underline">
                {t.nav.admin}
              </Link>
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
