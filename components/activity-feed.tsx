import Link from "next/link";
import { Bell, type LucideIcon } from "lucide-react";

export type ActivityItem = {
  id: string;
  icon: LucideIcon;
  iconClass: string;
  text: string;
  time: string;
  href?: string;
};

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en", { month: "short", day: "numeric" });
}

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <div className="rounded-2xl border border-line bg-paper p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Updates</p>
          <h2 className="font-display mt-2 text-xl text-ink">Recent Activity</h2>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-grad-volt">
          <Bell className="h-4.5 w-4.5 text-ink" />
        </span>
      </div>

      {items.length ? (
        <ul className="mt-5 space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const content = (
              <>
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${item.iconClass}`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1 text-sm text-ink">{item.text}</span>
                <span className="shrink-0 text-[11px] text-ink/40">{timeAgo(item.time)}</span>
              </>
            );
            return (
              <li key={item.id}>
                {item.href ? (
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-bg"
                  >
                    {content}
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 px-2 py-2.5">{content}</div>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-5 text-sm text-ink/40">No recent activity yet.</p>
      )}
    </div>
  );
}
