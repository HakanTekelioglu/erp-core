import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-sans"
});

export const metadata: Metadata = {
  title: "MiniERP",
  description: "Kucuk ve orta olcekli isletmeler icin modern ERP paneli"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const themeScript = `
    (() => {
      try {
        const storedTheme = localStorage.getItem("mini-erp-theme");
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (storedTheme === "dark" || (!storedTheme && prefersDark)) {
          document.documentElement.classList.add("dark");
        }
      } catch {}
    })();
  `;

  return (
    <html lang="tr" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans">
        {children}
        <Toaster richColors position="top-right" toastOptions={{ className: "font-sans" }} />
      </body>
    </html>
  );
}
