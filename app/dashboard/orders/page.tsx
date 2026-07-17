import Link from "next/link";
import { requireProfile } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";

const statusColor: Record<string, string> = {
  pending_payment: "text-paper/50",
  paid: "text-volt",
  in_progress: "text-volt",
  delivered: "text-volt",
  completed: "text-volt",
  disputed: "text-magenta",
  refunded: "text-paper/30",
  cancelled: "text-paper/30",
};

export default async function OrdersPage() {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select(
      "id, amount_kes, status, created_at, brand:profiles!orders_brand_id_fkey(first_name, last_name), creative:profiles!orders_creative_id_fkey(first_name, last_name)"
    )
    .or(`brand_id.eq.${profile.id},creative_id.eq.${profile.id}`)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-4xl uppercase text-paper">Orders</h1>

      <ul className="mt-8 space-y-2">
        {orders?.map((o) => {
          const counterpart = profile.role === "creative" ? o.brand : o.creative;
          return (
            <li key={o.id}>
              <Link
                href={`/dashboard/orders/${o.id}`}
                className="flex items-center justify-between rounded-lg border border-line px-4 py-3 transition hover:border-volt"
              >
                <span className="text-paper">
                  {counterpart ? `${counterpart.first_name} ${counterpart.last_name}` : "Order"} · Ksh{" "}
                  {o.amount_kes.toLocaleString()}
                </span>
                <span className={`text-xs uppercase ${statusColor[o.status] ?? "text-paper/50"}`}>
                  {o.status.replace("_", " ")}
                </span>
              </Link>
            </li>
          );
        })}
        {!orders?.length && <p className="text-sm text-paper/40">No orders yet.</p>}
      </ul>
    </div>
  );
}
