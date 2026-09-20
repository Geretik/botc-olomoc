import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "Blood on the Clocktower Olomouc",
  description: "Registrace na herní večery Blood on the Clocktower v Olomouci",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <header className="border-b border-border">
          <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
            <Link href="/" className="font-semibold tracking-tight text-lg">
              🕰️ Blood on the Clocktower <span className="text-muted">Olomouc</span>
            </Link>
          </div>
        </header>
        <main className="mx-auto w-full max-w-3xl px-4 py-8 flex-1">
          {children}
        </main>
        <footer className="border-t border-border">
          <div className="mx-auto max-w-3xl px-4 py-4 text-sm text-muted flex justify-between">
            <span>Herní večery v Olomouci</span>
            <Link href="/admin" className="hover:underline">
              Admin
            </Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
