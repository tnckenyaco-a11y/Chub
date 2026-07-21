import type { Metadata } from "next";
import { DM_Sans, Montserrat, Playfair_Display } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { createClient } from "@/lib/supabase/server";
import { getBranding, DEFAULT_BRANDING } from "@/lib/branding";
import { shadeHex } from "@/lib/color";

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
  const [
    {
      data: { user },
    },
    branding,
  ] = await Promise.all([supabase.auth.getUser(), getBranding()]);

  // Custom branding is opt-in: only override the CSS vars when the admin has
  // actually changed a color, so an untouched install renders the defaults
  // baked into globals.css exactly as before.
  const isCustomBranding =
    branding.color_brand !== DEFAULT_BRANDING.color_brand ||
    branding.color_volt !== DEFAULT_BRANDING.color_volt;
  const brandingStyle = isCustomBranding
    ? `:root {
        --color-brand: ${branding.color_brand};
        --color-brand-dark: ${shadeHex(branding.color_brand, -0.25)};
        --color-volt: ${branding.color_volt};
        --grad-brand: linear-gradient(160deg, ${branding.color_brand} 0%, ${shadeHex(branding.color_brand, -0.25)} 100%);
        --grad-volt: linear-gradient(135deg, ${shadeHex(branding.color_volt, 0.15)} 0%, ${branding.color_volt} 60%, ${shadeHex(branding.color_volt, -0.15)} 100%);
        --grad-text: linear-gradient(100deg, ${branding.color_brand}, ${branding.color_volt});
      }`
    : null;

  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${playfair.variable} ${montserrat.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-paper text-ink antialiased">
        {brandingStyle && <style dangerouslySetInnerHTML={{ __html: brandingStyle }} />}
        <SiteNav isSignedIn={Boolean(user)} logoUrl={branding.logo_dark_url} />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
