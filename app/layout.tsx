import type { Metadata } from "next";
import { DM_Sans, Montserrat, Playfair_Display } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { createClient } from "@/lib/supabase/server";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  weight: ["500", "600"],
  style: ["italic"],
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
    <html
      lang="en"
      className={`${dmSans.variable} ${playfair.variable} ${montserrat.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-paper text-ink antialiased">
        <SiteNav isSignedIn={Boolean(user)} />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
