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
      <h1 className="font-display text-3xl text-ink">Orders &amp; Payments</h1>

      <div className="mt-8 space-y-3">
        {orders?.map((o) => (
          <div key={o.id} className="rounded-2xl border border-line bg-paper p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-ink">
                {o.brand?.first_name} {o.brand?.last_name} → {o.creative?.first_name}{" "}
                {o.creative?.last_name}
              </p>
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${
                  statusStyle[o.status] ?? "bg-ink/5 text-ink/50"
                }`}
              >
                {o.status.replace("_", " ")}
              </span>
            </div>
            <p className="mt-1.5 text-xs text-ink/40">Ksh {o.amount_kes.toLocaleString()}</p>
            {o.payments && o.payments.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {o.payments.map((p, i) => (
                  <span
                    key={i}
                    className={`rounded-full px-2.5 py-1 font-semibold ${
                      p.status === "successful"
                        ? "bg-green/10 text-green"
                        : p.status === "failed"
                          ? "bg-magenta/10 text-magenta"
                          : "bg-ink/5 text-ink/40"
                    }`}
                  >
                    {p.kind}: {p.status}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
        {!orders?.length && <p className="text-sm text-ink/40">No orders yet.</p>}
      </div>
    </div>
  );
}
