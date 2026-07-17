import Image from "next/image";
import Link from "next/link";

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

export function SiteFooter() {
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
              className="h-9 w-auto"
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
          <div className="flex gap-6">
            <a
              href="https://www.instagram.com/creatorshub_inc/"
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-volt"
            >
              Instagram
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
