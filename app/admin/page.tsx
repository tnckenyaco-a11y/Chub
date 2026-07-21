import { Users, UserCheck, Wallet, ShoppingBag, type LucideIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

const ICON_STYLES = [
  { icon: Users, bg: "bg-grad-brand" },
  { icon: UserCheck, bg: "bg-linear-to-br from-green to-green/70" },
  { icon: Wallet, bg: "bg-grad-volt" },
  { icon: ShoppingBag, bg: "bg-linear-to-br from-amber-400 to-amber-600" },
];

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  const [
    { count: users },
    { count: activeUsers },
    { data: servicesByStatus },
    { data: projectsByStatus },
    { data: ordersByStatus },
    { data: completedOrders },
    { data: categoryCounts },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("is_suspended", false),
    supabase.from("services").select("status"),
    supabase.from("projects").select("status"),
    supabase.from("orders").select("status"),
    supabase.from("orders").select("amount_kes").eq("status", "completed"),
    supabase.from("services").select("categories(name)").eq("status", "published"),
  ]);

  const gmv = (completedOrders ?? []).reduce((sum, o) => sum + Number(o.amount_kes), 0);

  const tally = (rows: { status: string }[] | null) =>
    (rows ?? []).reduce<Record<string, number>>((acc, r) => {
      acc[r.status] = (acc[r.status] ?? 0) + 1;
      return acc;
    }, {});

  const serviceFunnel = tally(servicesByStatus);
  const projectFunnel = tally(projectsByStatus);
  const orderFunnel = tally(ordersByStatus);

  const topCategories = Object.entries(
    (categoryCounts ?? []).reduce<Record<string, number>>((acc, s) => {
      const name = s.categories?.name;
      if (name) acc[name] = (acc[name] ?? 0) + 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxCategoryCount = topCategories[0]?.[1] ?? 1;

  const stats = [
    { label: "Users", value: users ?? 0 },
    { label: "Active Users", value: activeUsers ?? 0 },
    { label: "GMV (Completed)", value: `Ksh ${gmv.toLocaleString()}` },
    { label: "Orders", value: ordersByStatus?.length ?? 0 },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Overview</h1>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => {
          const style = ICON_STYLES[i % ICON_STYLES.length];
          const Icon: LucideIcon = style.icon;
          return (
            <div
              key={s.label}
              className="rounded-2xl border border-line bg-paper p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
                  {s.label}
                </p>
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${style.bg}`}>
                  <Icon className="h-5 w-5 text-paper" />
                </span>
              </div>
              <p className="font-display mt-4 text-3xl text-ink">{s.value}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        <FunnelCard title="Services" funnel={serviceFunnel} />
        <FunnelCard title="Projects" funnel={projectFunnel} />
        <FunnelCard title="Orders" funnel={orderFunnel} />
      </div>

      <div className="mt-12 rounded-2xl border border-line bg-paper p-6 shadow-sm">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-ink/50">
          Top Categories (published services)
        </h2>
        <div className="mt-5 space-y-4">
          {topCategories.map(([name, count]) => (
            <div key={name}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-ink/80">{name}</span>
                <span className="font-semibold text-brand">{count}</span>
              </div>
              <div className="mt-1.5 h-1.5 rounded-full bg-bg">
                <div
                  className="h-full rounded-full bg-grad-brand"
                  style={{ width: `${(count / maxCategoryCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
          {!topCategories.length && (
            <p className="text-sm text-ink/40">No published services yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function FunnelCard({ title, funnel }: { title: string; funnel: Record<string, number> }) {
  const entries = Object.entries(funnel);
  return (
    <div className="rounded-2xl border border-line bg-paper p-6 shadow-sm">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-ink/50">{title}</h3>
      <div className="mt-4 space-y-2.5">
        {entries.map(([status, count]) => (
          <div key={status} className="flex items-center justify-between text-sm">
            <span className="capitalize text-ink/70">{status.replace("_", " ")}</span>
            <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-bold text-brand">
              {count}
            </span>
          </div>
        ))}
        {!entries.length && <p className="text-sm text-ink/40">No data yet.</p>}
      </div>
    </div>
  );
}
