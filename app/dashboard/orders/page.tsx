import Link from "next/link";
import { requireProfile } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";

const statusStyle: Record<string, string> = {
  pending_payment: "bg-ink/8 text-ink/55",
  paid: "bg-brand/10 text-brand",
  in_progress: "bg-brand/10 text-brand",
  delivered: "bg-brand/10 text-brand",
  completed: "bg-green/10 text-green",
  disputed: "bg-magenta/10 text-magenta",
  refunded: "bg-ink/5 text-ink/35",
  cancelled: "bg-ink/5 text-ink/35",
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
      <h1 className="font-display text-3xl text-ink">Orders</h1>

      <ul className="mt-8 space-y-2">
        {orders?.map((o) => {
          const counterpart = profile.role === "creative" ? o.brand : o.creative;
          return (
            <li key={o.id}>
              <Link
                href={`/dashboard/orders/${o.id}`}
                className="flex items-center justify-between rounded-xl border border-line bg-paper px-5 py-3.5 transition hover:-translate-y-0.5 hover:border-brand hover:shadow-sm"
              >
                <span className="font-medium text-ink">
                  {counterpart ? `${counterpart.first_name} ${counterpart.last_name}` : "Order"} · Ksh{" "}
                  {o.amount_kes.toLocaleString()}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${
                    statusStyle[o.status] ?? "bg-ink/5 text-ink/50"
                  }`}
                >
                  {o.status.replace("_", " ")}
                </span>
              </Link>
            </li>
          );
        })}
        {!orders?.length && <p className="text-sm text-ink/40">No orders yet.</p>}
      </ul>
    </div>
  );
}
