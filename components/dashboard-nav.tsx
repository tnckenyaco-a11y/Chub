"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Flag,
  MessageCircle,
  ShoppingBag,
  User,
  Settings,
} from "lucide-react";
import { signOut } from "@/app/(auth)/actions";

export function DashboardNav({ role }: { role: "creative" | "brand" | "admin" }) {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    ...(role === "creative"
      ? [
          { href: "/dashboard/services", label: "My Services", icon: Briefcase },
          { href: "/dashboard/proposals", label: "My Proposals", icon: FileText },
        ]
      : []),
    ...(role === "brand"
      ? [{ href: "/dashboard/projects", label: "My Projects", icon: Briefcase }]
      : []),
    { href: "/dashboard/orders", label: "Orders", icon: ShoppingBag },
    { href: "/dashboard/messages", label: "Messages", icon: MessageCircle },
  ];

  const bottomLinks = [
    { href: "/dashboard/profile", label: "Profile", icon: User },
    { href: "/dashboard/disputes", label: "Disputes", icon: Flag },
  ];

  return (
    <aside className="flex w-64 shrink-0 flex-col justify-between rounded-2xl bg-brand p-5">
      <div>
        <p className="px-2 text-xs font-semibold uppercase tracking-[0.3em] text-paper/60">
          Dashboard
        </p>
        <nav className="mt-4 flex flex-col gap-1">
          {links.map((link) => (
            <NavItem key={link.href} {...link} active={pathname === link.href} />
          ))}
        </nav>

        <div className="my-4 h-px bg-paper/15" />

        <nav className="flex flex-col gap-1">
          {bottomLinks.map((link) => (
            <NavItem key={link.href} {...link} active={pathname === link.href} />
          ))}
          <NavItem href="/dashboard/settings" label="Settings" icon={Settings} active={pathname === "/dashboard/settings"} />
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
    </aside>
  );
}

function NavItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
        active ? "bg-paper text-brand" : "text-paper/80 hover:bg-paper/10 hover:text-paper"
      }`}
    >
      <Icon size={18} />
      {label}
    </Link>
  );
}
