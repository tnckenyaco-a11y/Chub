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
  FileEdit,
  Newspaper,
} from "lucide-react";
import { signOut } from "@/app/(auth)/actions";

const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/listings", label: "Listings Moderation", icon: ClipboardCheck },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/orders", label: "Orders & Payments", icon: Receipt },
  { href: "/admin/disputes", label: "Disputes", icon: Flag },
  { href: "/admin/content", label: "Content (CMS)", icon: FileEdit },
  { href: "/admin/blog", label: "Blog", icon: Newspaper },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col justify-between rounded-2xl bg-brand p-5">
      <div>
        <p className="px-2 text-xs font-semibold uppercase tracking-[0.3em] text-paper/60">
          Admin
        </p>
        <nav className="mt-4 flex flex-col gap-1">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  active ? "bg-paper text-brand" : "text-paper/80 hover:bg-paper/10 hover:text-paper"
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
