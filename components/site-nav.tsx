"use client";

import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/creatives", label: "Creatives" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
];

export function SiteNav({ isSignedIn }: { isSignedIn: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-ink/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <Link href="/" className="font-display text-2xl uppercase tracking-tight text-paper">
          Nyx <span className="text-volt">Creators Hub</span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm uppercase tracking-wide text-paper/80 transition hover:text-volt"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <Link
            href={isSignedIn ? "/dashboard" : "/sign-in"}
            className="text-sm uppercase tracking-wide text-paper/80 transition hover:text-volt"
          >
            {isSignedIn ? "Dashboard" : "Sign In"}
          </Link>
          <Link
            href="/projects/new"
            className="rounded-full bg-volt px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-ink transition hover:bg-paper"
          >
            Post a Project
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-paper lg:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <span className="font-display text-sm uppercase tracking-wide">{open ? "Close" : "Menu"}</span>
        </button>
      </div>

      {open && (
        <div className="border-t border-line px-6 py-6 lg:hidden">
          <nav className="flex flex-col gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="font-display text-2xl uppercase text-paper"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={isSignedIn ? "/dashboard" : "/sign-in"}
              onClick={() => setOpen(false)}
              className="font-display text-2xl uppercase text-paper"
            >
              {isSignedIn ? "Dashboard" : "Sign In"}
            </Link>
            <Link
              href="/projects/new"
              onClick={() => setOpen(false)}
              className="mt-2 inline-block w-fit rounded-full bg-volt px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-ink"
            >
              Post a Project
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
