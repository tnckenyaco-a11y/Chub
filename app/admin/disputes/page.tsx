import { createClient } from "@/lib/supabase/server";
import { resolveDispute } from "@/app/admin/disputes/actions";

export default async function AdminDisputesPage() {
  const supabase = await createClient();
  const { data: disputes } = await supabase
    .from("disputes")
    .select(
      "id, reason, status, created_at, raised_by:profiles!disputes_raised_by_fkey(first_name, last_name), orders(id, amount_kes, brand:profiles!orders_brand_id_fkey(first_name, last_name), creative:profiles!orders_creative_id_fkey(first_name, last_name))"
    )
    .order("created_at", { ascending: false });

  const open = disputes?.filter((d) => d.status === "open") ?? [];
  const resolved = disputes?.filter((d) => d.status !== "open") ?? [];

  return (
    <div>
      <h1 className="font-display text-4xl uppercase text-ink">Disputes</h1>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/50">
          Open ({open.length})
        </h2>
        <div className="mt-4 space-y-4">
          {open.map((d) => {
            const resolve = resolveDispute.bind(null, d.id);
            return (
              <div key={d.id} className="rounded-2xl border border-magenta/40 p-5">
                <p className="text-sm text-ink">
                  {d.orders?.brand?.first_name} {d.orders?.brand?.last_name} ↔{" "}
                  {d.orders?.creative?.first_name} {d.orders?.creative?.last_name} · Ksh{" "}
                  {d.orders?.amount_kes.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-ink/40">
                  Raised by {d.raised_by?.first_name} {d.raised_by?.last_name}
                </p>
                <p className="mt-3 text-sm text-ink/70">{d.reason}</p>
                <form action={resolve} className="mt-4 space-y-3">
                  <textarea
                    name="notes"
                    rows={2}
                    placeholder="Resolution notes…"
                    className="w-full rounded-lg border border-line bg-transparent px-4 py-2.5 text-sm text-ink outline-none focus:border-volt"
                  />
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="submit"
                      name="resolution"
                      value="resolved_released"
                      className="rounded-full bg-volt px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-ink"
                    >
                      Release to Creative
                    </button>
                    <button
                      type="submit"
                      name="resolution"
                      value="resolved_refunded"
                      className="rounded-full border border-magenta/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-magenta"
                    >
                      Refund Brand
                    </button>
                    <button
                      type="submit"
                      name="resolution"
                      value="resolved_split"
                      className="rounded-full border border-line px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-ink/70"
                    >
                      Mark as Split (manual)
                    </button>
                  </div>
                </form>
              </div>
            );
          })}
          {!open.length && <p className="text-sm text-ink/40">No open disputes.</p>}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/50">
          Resolved ({resolved.length})
        </h2>
        <div className="mt-4 space-y-2">
          {resolved.map((d) => (
            <div key={d.id} className="rounded-lg border border-line px-4 py-3 text-sm">
              <span className="text-ink/70">{d.reason}</span>
              <span className="ml-3 text-xs uppercase text-volt">
                {d.status.replace("_", " ")}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
