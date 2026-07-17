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

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select(
      "id, amount_kes, status, created_at, brand:profiles!orders_brand_id_fkey(first_name, last_name), creative:profiles!orders_creative_id_fkey(first_name, last_name), payments(kind, status, provider_ref)"
    )
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-4xl uppercase text-paper">Orders &amp; Payments</h1>

      <div className="mt-8 space-y-3">
        {orders?.map((o) => (
          <div key={o.id} className="rounded-2xl border border-line p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-paper">
                {o.brand?.first_name} {o.brand?.last_name} → {o.creative?.first_name}{" "}
                {o.creative?.last_name}
              </p>
              <span className={`text-xs uppercase ${statusColor[o.status] ?? "text-paper/50"}`}>
                {o.status.replace("_", " ")}
              </span>
            </div>
            <p className="mt-1 text-xs text-paper/40">Ksh {o.amount_kes.toLocaleString()}</p>
            {o.payments && o.payments.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-3 text-xs">
                {o.payments.map((p, i) => (
                  <span
                    key={i}
                    className={
                      p.status === "successful"
                        ? "text-volt"
                        : p.status === "failed"
                          ? "text-magenta"
                          : "text-paper/40"
                    }
                  >
                    {p.kind}: {p.status}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
        {!orders?.length && <p className="text-sm text-paper/40">No orders yet.</p>}
      </div>
    </div>
  );
}
