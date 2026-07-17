import type { Metadata } from "next";
import { DM_Sans, Geist_Mono, Playfair_Display } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Migajas — Aprende a contar carbohidratos",
  description:
    "Tu guía amable para el conteo de carbohidratos con comida real de tu país.",
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
