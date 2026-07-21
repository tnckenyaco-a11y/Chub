import {
  Banknote,
  Briefcase,
  CheckCircle2,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";
import { requireProfile } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";

const ICON_STYLES = [
  { icon: Briefcase, bg: "bg-grad-brand" },
  { icon: ClipboardList, bg: "bg-grad-volt" },
  { icon: CheckCircle2, bg: "bg-linear-to-br from-green to-green/70" },
  { icon: Banknote, bg: "bg-linear-to-br from-amber-400 to-amber-600" },
];

export default async function DashboardPage() {
  const profile = await requireProfile();
  const supabase = await createClient();

  const stats = await getStats(supabase, profile.id, profile.role);

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">
        {profile.role}
      </p>
      <h1 className="font-display mt-3 text-3xl text-ink sm:text-4xl">
        Welcome back, {profile.first_name || profile.username}
      </h1>

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
    </div>
  );
}

async function getStats(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  role: "creative" | "brand" | "admin"
) {
  if (role === "creative") {
    const [{ count: services }, { count: orders }, { data: completed }] = await Promise.all([
      supabase.from("services").select("*", { count: "exact", head: true }).eq("creative_id", userId),
      supabase.from("orders").select("*", { count: "exact", head: true }).eq("creative_id", userId),
      supabase.from("orders").select("amount_kes").eq("creative_id", userId).eq("status", "completed"),
    ]);
    const revenue = (completed ?? []).reduce((sum, o) => sum + Number(o.amount_kes), 0);
    return [
      { label: "Services", value: services ?? 0 },
      { label: "Orders", value: orders ?? 0 },
      { label: "Completed", value: completed?.length ?? 0 },
      { label: "Revenue Earned", value: `Ksh ${revenue.toLocaleString()}` },
    ];
  }

  if (role === "brand") {
    const [{ count: projects }, { count: orders }, { data: completed }] = await Promise.all([
      supabase.from("projects").select("*", { count: "exact", head: true }).eq("brand_id", userId),
      supabase.from("orders").select("*", { count: "exact", head: true }).eq("brand_id", userId),
      supabase.from("orders").select("amount_kes").eq("brand_id", userId).eq("status", "completed"),
    ]);
    const spend = (completed ?? []).reduce((sum, o) => sum + Number(o.amount_kes), 0);
    return [
      { label: "Projects Posted", value: projects ?? 0 },
      { label: "Orders", value: orders ?? 0 },
      { label: "Completed", value: completed?.length ?? 0 },
      { label: "Total Spend", value: `Ksh ${spend.toLocaleString()}` },
    ];
  }

  return [];
}
