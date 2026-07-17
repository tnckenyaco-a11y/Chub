import Link from "next/link";
import { requireProfile } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";

export default async function MyDisputesPage() {
  await requireProfile();
  const supabase = await createClient();

  const { data: disputes } = await supabase
    .from("disputes")
    .select("id, reason, status, created_at, order_id, orders(amount_kes)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-4xl uppercase text-paper">Disputes</h1>

      <ul className="mt-8 space-y-2">
        {disputes?.map((d) => (
          <li key={d.id}>
            <Link
              href={`/dashboard/orders/${d.order_id}`}
              className="flex items-center justify-between rounded-lg border border-line px-4 py-3 transition hover:border-volt"
            >
              <span className="text-paper">{d.reason}</span>
              <span className="flex items-center gap-4">
                <span className="text-xs text-paper/40">
                  Ksh {d.orders?.amount_kes.toLocaleString()}
                </span>
                <span className="text-xs uppercase text-volt">{d.status.replace("_", " ")}</span>
              </span>
            </Link>
          </li>
        ))}
        {!disputes?.length && (
          <p className="text-sm text-paper/40">
            No disputes — raise one from an order if something goes wrong.
          </p>
        )}
      </ul>
    </div>
  );
}
