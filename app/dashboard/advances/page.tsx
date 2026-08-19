import Link from "next/link";
import { requireProfile } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";

const STATUS_STYLE: Record<string, string> = {
  requested: "bg-ink/8 text-ink/55",
  approved: "bg-green/10 text-green",
  partial: "bg-volt/10 text-volt",
  declined: "bg-magenta/10 text-magenta",
  disbursed: "bg-brand/10 text-brand",
  repaid: "bg-green/10 text-green",
};

export default async function AdvancesPage() {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: advances } = await supabase
    .from("advance_requests")
    .select(
      "id, order_id, requested_amount_kes, approved_amount_kes, status, created_at, orders(service_packages(title, services(title)), proposals(projects(title)))"
    )
    .eq("creative_id", profile.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Nyx Advance</h1>
      <p className="mt-2 text-sm text-ink/50">
        Requests to unlock part of an escrowed gig&apos;s payment early.
      </p>

      <ul className="mt-8 space-y-2">
        {advances?.map((a) => {
          const context = a.orders?.service_packages
            ? `${a.orders.service_packages.services?.title} — ${a.orders.service_packages.title}`
            : (a.orders?.proposals?.projects?.title ?? "Order");
          return (
            <li key={a.id}>
              <Link
                href={`/dashboard/orders/${a.order_id}`}
                className="flex items-center justify-between rounded-xl border border-line bg-paper px-5 py-3.5 transition hover:-translate-y-0.5 hover:border-brand hover:shadow-sm"
              >
                <span className="font-medium text-ink">
                  {context} · Ksh{" "}
                  {(a.approved_amount_kes ?? a.requested_amount_kes).toLocaleString()}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${
                    STATUS_STYLE[a.status] ?? "bg-ink/5 text-ink/50"
                  }`}
                >
                  {a.status}
                </span>
              </Link>
            </li>
          );
        })}
        {!advances?.length && (
          <p className="text-sm text-ink/40">
            No advance requests yet — you can request one from an eligible order.
          </p>
        )}
      </ul>
    </div>
  );
}
