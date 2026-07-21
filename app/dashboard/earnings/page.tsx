import { forbidden } from "next/navigation";
import Link from "next/link";
import { Phone, CheckCircle2 } from "lucide-react";
import { requireProfile } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";

export default async function EarningsPage() {
  const profile = await requireProfile();
  if (profile.role !== "creative") forbidden();

  const supabase = await createClient();

  const [{ data: fullProfile }, { data: completedOrders }, { data: pendingOrders }, { data: payouts }] =
    await Promise.all([
      supabase.from("profiles").select("phone").eq("id", profile.id).single(),
      supabase
        .from("orders")
        .select("amount_kes")
        .eq("creative_id", profile.id)
        .eq("status", "completed"),
      supabase
        .from("orders")
        .select("amount_kes")
        .eq("creative_id", profile.id)
        .in("status", ["paid", "in_progress", "delivered"]),
      supabase
        .from("payments")
        .select(
          "id, amount_kes, status, created_at, orders!inner(id, creative_id, service_packages(title, services(title)), proposals(projects(title)))"
        )
        .eq("kind", "payout")
        .eq("orders.creative_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

  const totalEarned = (completedOrders ?? []).reduce((sum, o) => sum + Number(o.amount_kes), 0);
  const pendingClearance = (pendingOrders ?? []).reduce((sum, o) => sum + Number(o.amount_kes), 0);
  const lastPayout = payouts?.find((p) => p.status === "successful");

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl text-ink">Earnings</h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-paper p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink/45">
            Total Earned
          </p>
          <p className="font-display mt-2.5 text-2xl text-brand">
            Ksh {totalEarned.toLocaleString()}
          </p>
          <p className="mt-1.5 text-[11px] text-ink/40">All-time, from completed orders</p>
        </div>
        <div className="rounded-2xl border border-line bg-paper p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink/45">
            Pending Clearance
          </p>
          <p className="font-display mt-2.5 text-2xl text-volt">
            Ksh {pendingClearance.toLocaleString()}
          </p>
          <p className="mt-1.5 text-[11px] text-ink/40">Releases once the brand approves</p>
        </div>
        <div className="rounded-2xl border border-line bg-paper p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink/45">
            Last Payout
          </p>
          <p className="font-display mt-2.5 text-2xl text-ink">
            {lastPayout
              ? new Date(lastPayout.created_at).toLocaleDateString("en", {
                  month: "short",
                  day: "numeric",
                })
              : "—"}
          </p>
          <p className="mt-1.5 text-[11px] text-ink/40">
            {lastPayout ? `Ksh ${lastPayout.amount_kes.toLocaleString()} sent to M-Pesa` : "No payouts yet"}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-paper p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-ink">Payout Method</h2>
        <p className="mt-1 text-xs text-ink/50">
          Where your earnings are sent automatically once an order is completed.
        </p>
        <div className="mt-4 flex items-center gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green/10 text-green">
            <Phone className="h-4.5 w-4.5" />
          </div>
          {fullProfile?.phone ? (
            <div>
              <p className="font-display text-sm text-ink">{fullProfile.phone}</p>
              <p className="mt-0.5 flex items-center gap-1 text-[11px] text-green">
                <CheckCircle2 className="h-3 w-3" /> On file
              </p>
            </div>
          ) : (
            <p className="text-sm text-ink/50">No payout number on file yet.</p>
          )}
          <Link
            href="/dashboard/profile"
            className="ml-auto rounded-full border border-line px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ink/70 transition hover:border-brand hover:text-brand"
          >
            Update
          </Link>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-paper p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-ink">Payout History</h2>
        <p className="mt-1 text-xs text-ink/50">Your last 10 payouts.</p>
        <div className="mt-4 space-y-2">
          {payouts?.map((p) => {
            const context = p.orders?.service_packages
              ? `${p.orders.service_packages.services?.title} — ${p.orders.service_packages.title}`
              : p.orders?.proposals?.projects?.title ?? "Order";
            return (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-xl border border-line px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-ink">{context}</p>
                  <p className="mt-0.5 text-xs text-ink/40">
                    {new Date(p.created_at).toLocaleDateString("en", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-sm text-ink">
                    Ksh {p.amount_kes.toLocaleString()}
                  </p>
                  <span
                    className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                      p.status === "successful"
                        ? "bg-green/10 text-green"
                        : p.status === "failed"
                          ? "bg-magenta/10 text-magenta"
                          : "bg-ink/8 text-ink/55"
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
              </div>
            );
          })}
          {!payouts?.length && <p className="text-sm text-ink/40">No payouts yet.</p>}
        </div>
      </div>
    </div>
  );
}
