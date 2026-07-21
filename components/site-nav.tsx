"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/creatives", label: "Creatives" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
];

export function SiteNav({
  isSignedIn,
  logoUrl,
}: {
  isSignedIn: boolean;
  logoUrl?: string | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sticky top-3 z-50 mx-3 sm:mx-6">
      <header className="mx-auto max-w-7xl rounded-2xl border border-line/60 bg-paper/70 shadow-[0_8px_24px_rgba(27,18,11,0.06)] backdrop-blur-xl">
        <div className="flex items-center justify-between px-5 py-3.5 lg:px-8">
          <Link href="/" className="flex items-center">
            <Image
              src={logoUrl || "/logo-lockup-dark.png"}
              alt="Creators Hub"
              width={1844}
              height={494}
              priority
              className="h-7 w-auto sm:h-8"
              unoptimized={Boolean(logoUrl)}
            />
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-display text-xs font-medium text-ink/70 transition hover:text-brand"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-4 lg:flex">
            <Link
              href={isSignedIn ? "/dashboard" : "/sign-in"}
              className="font-display text-xs font-semibold text-ink transition hover:text-brand"
            >
              {isSignedIn ? "Dashboard" : "Sign In"}
            </Link>
            <Link
              href="/projects/new"
              className="font-display rounded-full bg-grad-volt px-5 py-2.5 text-xs font-semibold text-ink shadow-[0_6px_16px_rgba(255,123,16,0.25)] transition hover:opacity-90"
            >
              Post a Project
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="text-ink lg:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <span className="font-display text-sm uppercase tracking-wide">{open ? "Close" : "Menu"}</span>
          </button>
        </div>

        {open && (
          <div className="border-t border-line px-5 py-6 lg:hidden">
            <nav className="flex flex-col gap-4">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="font-display text-2xl text-ink"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href={isSignedIn ? "/dashboard" : "/sign-in"}
                onClick={() => setOpen(false)}
                className="font-display text-2xl text-ink"
              >
                {isSignedIn ? "Dashboard" : "Sign In"}
              </Link>
              <Link
                href="/projects/new"
                onClick={() => setOpen(false)}
                className="font-display mt-2 inline-block w-fit rounded-full bg-grad-volt px-5 py-2.5 text-sm font-semibold text-ink"
              >
                Post a Project
              </Link>
            </nav>
          </div>
        )}
      </header>
    </div>
  );
}
