import type { Metadata } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "../globals.css";

const heading = Baloo_2({ variable: "--font-heading", subsets: ["latin"] });
const body = Nunito({ variable: "--font-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Shikhi Digital Admin",
  robots: { index: false, follow: false },
};

/**
 * A second root layout. /admin sits outside the [locale] tree on purpose — it
 * is an adult-facing tool in one language, and keeping it out means the locale
 * proxy never has to rewrite it.
 */
export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable} h-full antialiased`}>
      <body className="min-h-full bg-muted/40">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
