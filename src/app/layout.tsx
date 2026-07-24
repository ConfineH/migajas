import type { Metadata } from "next";
import { DM_Sans, Geist_Mono, Playfair_Display } from "next/font/google";
import { SEO_COPY } from "@/lib/domain/brand-positioning";
import { hydrateContentFromSupabase } from "@/lib/content-server";
import { CookieConsentGate } from "@/components/CookieConsentGate";
import { SiteFooter } from "@/components/SiteFooter";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://migajas.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: SEO_COPY.title,
  description: SEO_COPY.description,
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "Migajas",
    title: SEO_COPY.title,
    description: SEO_COPY.openGraphDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: SEO_COPY.title,
    description: SEO_COPY.description,
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await hydrateContentFromSupabase();

  return (
    <html
      lang="es"
      className={`${dmSans.variable} ${playfair.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        {children}
        <SiteFooter />
        <CookieConsentGate />
      </body>
    </html>
  );
}
