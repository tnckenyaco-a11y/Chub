"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Flag,
  MessageCircle,
  ShoppingBag,
  TrendingUp,
  User,
  Settings,
} from "lucide-react";
import { signOut } from "@/app/(auth)/actions";

export function DashboardNav({ role }: { role: "creative" | "brand" | "admin" }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    ...(role === "creative"
      ? [
          { href: "/dashboard/services", label: "My Services", icon: Briefcase },
          { href: "/dashboard/proposals", label: "Proposals & Invites", icon: FileText },
        ]
      : []),
    ...(role === "brand"
      ? [{ href: "/dashboard/projects", label: "My Projects", icon: Briefcase }]
      : []),
    { href: "/dashboard/orders", label: "Orders", icon: ShoppingBag },
    ...(role === "creative"
      ? [{ href: "/dashboard/earnings", label: "Earnings", icon: TrendingUp }]
      : []),
    { href: "/dashboard/messages", label: "Messages", icon: MessageCircle },
  ];

  const bottomLinks = [
    { href: "/dashboard/profile", label: "Profile", icon: User },
    { href: "/dashboard/disputes", label: "Disputes", icon: Flag },
  ];

  const navContent = (
    <>
      <div>
        <p className="px-2 text-xs font-semibold uppercase tracking-[0.3em] text-paper/50">
          Dashboard
        </p>
        <nav className="mt-4 flex flex-col gap-1">
          {links.map((link) => (
            <NavItem key={link.href} {...link} active={pathname === link.href} onClick={() => setOpen(false)} />
          ))}
        </nav>

        <div className="my-4 h-px bg-paper/15" />

        <nav className="flex flex-col gap-1">
          {bottomLinks.map((link) => (
            <NavItem key={link.href} {...link} active={pathname === link.href} onClick={() => setOpen(false)} />
          ))}
          <NavItem
            href="/dashboard/settings"
            label="Settings"
            icon={Settings}
            active={pathname === "/dashboard/settings"}
            onClick={() => setOpen(false)}
          />
        </nav>
      </div>

      <form action={signOut}>
        <button
          type="submit"
          className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-paper/70 transition hover:bg-paper/10 hover:text-paper"
        >
          Logout
        </button>
      </form>
    </>
  );

  return (
    <>
      <div className="rounded-2xl bg-grad-brand p-4 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex w-full items-center justify-between text-sm font-semibold text-paper"
        >
          Dashboard Menu
          <span className="text-xs uppercase tracking-wide text-paper/70">{open ? "Close" : "Menu"}</span>
        </button>
        {open && <div className="mt-4 flex flex-col justify-between gap-4">{navContent}</div>}
      </div>

      <aside className="hidden w-64 shrink-0 flex-col justify-between rounded-2xl bg-grad-brand p-5 lg:flex">
        {navContent}
      </aside>
    </>
  );
}

function NavItem({
  href,
  label,
  icon: Icon,
  active,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
        active ? "bg-paper text-brand shadow-sm" : "text-paper/80 hover:bg-paper/10 hover:text-paper"
      }`}
    >
      <Icon size={18} />
      {label}
    </Link>
  );
}
