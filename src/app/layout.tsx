import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { hydrateContentFromSupabase } from "@/lib/content-server";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Migajas — Aprende a contar carbohidratos",
  description:
    "App educativa para aprender conteo de carbohidratos por niveles, empezando por España.",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-stone-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
