import type { Metadata, Viewport } from "next";
import { DM_Sans, Geist_Mono, Playfair_Display } from "next/font/google";
import { hydrateContentFromSupabase } from "@/lib/content-server";
import { buildRootMetadata, buildRootViewport } from "@/lib/site-metadata";
import { CookieConsentGate } from "@/components/CookieConsentGate";
import { PwaServiceWorker } from "@/components/PwaServiceWorker";
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

export const metadata: Metadata = buildRootMetadata();
export const viewport: Viewport = buildRootViewport();

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
        <PwaServiceWorker />
      </body>
    </html>
  );
}
