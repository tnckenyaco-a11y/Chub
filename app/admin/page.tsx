import { createClient } from "@/lib/supabase/server";

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

  const stats = [
    { label: "Users", value: users ?? 0 },
    { label: "Active Users", value: activeUsers ?? 0 },
    { label: "GMV (Completed)", value: `Ksh ${gmv.toLocaleString()}` },
    { label: "Orders", value: ordersByStatus?.length ?? 0 },
  ];

  return (
    <div>
      <h1 className="font-display text-4xl uppercase text-ink">Overview</h1>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-line p-6">
            <p className="font-display text-3xl text-volt">{s.value}</p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-ink/50">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-3">
        <FunnelCard title="Services" funnel={serviceFunnel} />
        <FunnelCard title="Projects" funnel={projectFunnel} />
        <FunnelCard title="Orders" funnel={orderFunnel} />
      </div>

      <div className="mt-12">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/50">
          Top Categories (published services)
        </h2>
        <div className="mt-4 space-y-2">
          {topCategories.map(([name, count]) => (
            <div key={name} className="flex items-center justify-between text-sm">
              <span className="text-ink/70">{name}</span>
              <span className="text-volt">{count}</span>
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
    <div className="rounded-2xl border border-line p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-ink/50">{title}</h3>
      <div className="mt-4 space-y-2">
        {entries.map(([status, count]) => (
          <div key={status} className="flex items-center justify-between text-sm">
            <span className="capitalize text-ink/70">{status.replace("_", " ")}</span>
            <span className="text-ink">{count}</span>
          </div>
        ))}
        {!entries.length && <p className="text-sm text-ink/40">No data yet.</p>}
      </div>
    </div>
  );
}
