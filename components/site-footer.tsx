import Image from "next/image";
import Link from "next/link";
import { getSitePage } from "@/lib/site-pages";
import { InstagramIcon, TikTokIcon, LinkedInIcon, WhatsAppIcon, YouTubeIcon } from "@/components/social-icons";

const columns = [
  {
    title: "About",
    links: [
      { href: "/about", label: "About Us" },
      { href: "/blog", label: "Blog" },
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Contact Us" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/privacy-policy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Use" },
      { href: "/help-center", label: "Help Center" },
    ],
  },
];

type SocialEntry = { url: string; enabled: boolean };
type SocialContent = Record<string, SocialEntry>;

const SOCIAL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: InstagramIcon,
  tiktok: TikTokIcon,
  linkedin: LinkedInIcon,
  whatsapp: WhatsAppIcon,
  youtube: YouTubeIcon,
};

export async function SiteFooter() {
  const socialPage = await getSitePage<SocialContent>("social_links");
  const socialLinks = Object.entries(socialPage?.content ?? {}).filter(
    ([, entry]) => entry.enabled && entry.url
  );

  return (
    <footer className="border-t border-paper/15 bg-brand">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[2fr_1fr_1fr]">
          <div>
            <Image
              src="/logo-lockup-white.png"
              alt="Creators Hub"
              width={2782}
              height={708}
              className="h-9 w-auto self-start"
            />
            <p className="mt-4 max-w-sm text-sm text-paper/70">
              The trusted marketplace connecting Africa&apos;s creative talent with brands
              who need them — vetted creatives, guaranteed payment, real work.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-semibold uppercase tracking-widest text-paper/50">
                {col.title}
              </p>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-paper/80 transition hover:text-volt"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-16 flex flex-col gap-4 border-t border-paper/15 pt-8 text-xs text-paper/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Nyx House of Creatives. All rights reserved.</p>
          {socialLinks.length > 0 && (
            <div className="flex gap-4">
              {socialLinks.map(([key, entry]) => {
                const Icon = SOCIAL_ICONS[key];
                return (
                  <a
                    key={key}
                    href={entry.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={key}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-paper/20 transition hover:border-volt hover:text-volt"
                  >
                    {Icon && <Icon className="h-3.5 w-3.5" />}
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
