import type { Metadata } from "next";
import { Anton, Manrope } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { createClient } from "@/lib/supabase/server";

const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nyx Creators Hub — The Future of African Creativity",
  description:
    "The trusted marketplace connecting Africa's creative talent with brands who need them.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en" className={`${anton.variable} ${manrope.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-ink text-paper antialiased">
        <SiteNav isSignedIn={Boolean(user)} />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
