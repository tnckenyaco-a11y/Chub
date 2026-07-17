import Link from "next/link";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/listings", label: "Listings Moderation" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/orders", label: "Orders & Payments" },
  { href: "/admin/disputes", label: "Disputes" },
  { href: "/admin/content", label: "Content (CMS)" },
  { href: "/admin/blog", label: "Blog" },
];

export function AdminNav() {
  return (
    <aside className="w-56 shrink-0">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-volt">Admin</p>
      <nav className="mt-4 flex flex-col gap-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-lg px-3 py-2 text-sm text-paper/70 transition hover:bg-paper/5 hover:text-paper"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
