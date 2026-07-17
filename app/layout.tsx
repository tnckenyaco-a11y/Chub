import type { Metadata } from "next";
import { Baloo_2, Montserrat } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { createClient } from "@/lib/supabase/server";

const baloo = Baloo_2({
  variable: "--font-baloo",
  weight: ["600", "700", "800"],
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
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
    <html lang="en" className={`${baloo.variable} ${montserrat.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-ink text-paper antialiased">
        <SiteNav isSignedIn={Boolean(user)} />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
