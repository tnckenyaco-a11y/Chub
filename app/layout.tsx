import type { Metadata } from "next";
import { DM_Sans, Montserrat, Playfair_Display } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { createClient } from "@/lib/supabase/server";
import { getBranding, DEFAULT_BRANDING } from "@/lib/branding";
import { getSiteIdentity } from "@/lib/site-identity";
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

export async function generateMetadata(): Promise<Metadata> {
  const identity = await getSiteIdentity();

  return {
    metadataBase: new URL("https://chub.nyxcollective.africa"),
    title: {
      default: `${identity.site_name} — The Future of African Creativity`,
      template: `%s · ${identity.site_name}`,
    },
    description: identity.tagline,
    openGraph: {
      siteName: identity.site_name,
      title: identity.site_name,
      description: identity.tagline,
      images: identity.og_image_url ? [identity.og_image_url] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: identity.site_name,
      description: identity.tagline,
      images: identity.og_image_url ? [identity.og_image_url] : undefined,
    },
  };
}

const SITE_URL = "https://chub.nyxcollective.africa";

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
    identity,
  ] = await Promise.all([supabase.auth.getUser(), getBranding(), getSiteIdentity()]);

  // Organization + WebSite structured data — helps search engines understand
  // the business (and can unlock a sitelinks search box in results) once the
  // site is actually indexed. Content is admin-controlled (site_pages), not
  // user input, so safe to inline directly.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: identity.site_name,
        legalName: identity.legal_name,
        url: SITE_URL,
        logo: identity.og_image_url ?? `${SITE_URL}/logo-icon-purple.png`,
        description: identity.tagline,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: identity.site_name,
        url: SITE_URL,
        publisher: { "@id": `${SITE_URL}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/services?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {brandingStyle && <style dangerouslySetInnerHTML={{ __html: brandingStyle }} />}
        <SiteNav isSignedIn={Boolean(user)} logoUrl={branding.logo_dark_url} />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
