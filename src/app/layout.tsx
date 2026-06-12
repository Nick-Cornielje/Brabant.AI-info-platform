import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "brabant.ai — AI Ecosysteem",
  description:
    "Ontdek het AI-ecosysteem in Brabant. Verbindt organisaties met kennis, talent en innovatie.",
  openGraph: {
    title: "brabant.ai — AI Ecosysteem",
    description:
      "Ontdek het AI-ecosysteem in Brabant. Verbindt organisaties met kennis, talent en innovatie.",
    locale: "nl_NL",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body className={inter.className}>
        <header className="border-b border-gray-100 bg-white sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <a href="/" className="font-bold text-brand text-lg tracking-tight">
              brabant<span className="text-gray-900">.ai</span>
            </a>
            <nav className="flex gap-6 text-sm text-gray-600">
              <a
                href="/stakeholders"
                className="hover:text-brand transition-colors"
              >
                Stakeholders
              </a>
              <a
                href="/trainingen"
                className="hover:text-brand transition-colors"
              >
                Trainingen
              </a>
              <a
                href="/ecosysteem"
                className="hover:text-brand transition-colors"
              >
                Ecosysteem
              </a>
              <a
                href="/kaart"
                className="hover:text-brand transition-colors"
              >
                Kaart
              </a>
            </nav>
          </div>
        </header>
        <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>
        <footer className="border-t border-gray-100 mt-16 py-8 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} brabant.ai
        </footer>
      </body>
    </html>
  );
}
