import Link from "next/link";

export function DashboardNav({ role }: { role: "creative" | "brand" | "admin" }) {
  const links = [
    { href: "/dashboard", label: "Overview" },
    ...(role === "creative"
      ? [
          { href: "/dashboard/services", label: "My Services" },
          { href: "/dashboard/proposals", label: "My Proposals" },
        ]
      : []),
    ...(role === "brand"
      ? [{ href: "/dashboard/projects", label: "My Projects" }]
      : []),
    { href: "/dashboard/orders", label: "Orders" },
    { href: "/dashboard/messages", label: "Messages" },
  ];

  return (
    <aside className="w-56 shrink-0">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-volt">Dashboard</p>
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
