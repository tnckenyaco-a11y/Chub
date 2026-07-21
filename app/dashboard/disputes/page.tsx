import Link from "next/link";
import { requireProfile } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";

const statusStyle: Record<string, string> = {
  open: "bg-magenta/10 text-magenta",
  resolved: "bg-green/10 text-green",
  refunded: "bg-ink/8 text-ink/55",
};

export default async function MyDisputesPage() {
  await requireProfile();
  const supabase = await createClient();

  const { data: disputes } = await supabase
    .from("disputes")
    .select("id, reason, status, created_at, order_id, orders(amount_kes)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Disputes</h1>

      <ul className="mt-8 space-y-2">
        {disputes?.map((d) => (
          <li key={d.id}>
            <Link
              href={`/dashboard/orders/${d.order_id}`}
              className="flex items-center justify-between rounded-xl border border-line bg-paper px-5 py-3.5 transition hover:-translate-y-0.5 hover:border-brand hover:shadow-sm"
            >
              <span className="font-medium text-ink">{d.reason}</span>
              <span className="flex items-center gap-4">
                <span className="text-xs text-ink/40">
                  Ksh {d.orders?.amount_kes.toLocaleString()}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${
                    statusStyle[d.status] ?? "bg-ink/5 text-ink/50"
                  }`}
                >
                  {d.status.replace("_", " ")}
                </span>
              </span>
            </Link>
          </li>
        ))}
        {!disputes?.length && (
          <p className="text-sm text-ink/40">
            No disputes — raise one from an order if something goes wrong.
          </p>
        )}
      </ul>
    </div>
  );
}
