"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  Tags,
  Receipt,
  Flag,
  Mail,
  FileEdit,
  Newspaper,
  Settings,
} from "lucide-react";
import { signOut } from "@/app/(auth)/actions";

const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/listings", label: "Listings Moderation", icon: ClipboardCheck },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/orders", label: "Orders & Payments", icon: Receipt },
  { href: "/admin/disputes", label: "Disputes", icon: Flag },
  { href: "/admin/contact", label: "Messages", icon: Mail },
  { href: "/admin/content", label: "Content (CMS)", icon: FileEdit },
  { href: "/admin/blog", label: "Blog", icon: Newspaper },
  { href: "/admin/settings", label: "Platform Settings", icon: Settings },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col justify-between rounded-2xl bg-grad-brand p-5">
      <div>
        <div className="flex items-center gap-2 px-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-paper/50">
            Admin
          </p>
          <span className="rounded-full bg-grad-volt px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-ink">
            Staff
          </span>
        </div>
        <nav className="mt-4 flex flex-col gap-1">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active ? "bg-paper text-brand shadow-sm" : "text-paper/80 hover:bg-paper/10 hover:text-paper"
                }`}
              >
                <Icon size={18} />
                {link.label}
              </Link>
            );
          })}
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
