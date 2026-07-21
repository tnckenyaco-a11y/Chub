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
      <h1 className="font-display text-3xl text-ink">Disputes</h1>

      <section className="mt-10">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-ink/50">
          Open ({open.length})
        </h2>
        <div className="mt-4 space-y-4">
          {open.map((d) => {
            const resolve = resolveDispute.bind(null, d.id);
            return (
              <div key={d.id} className="overflow-hidden rounded-2xl border border-magenta/30 bg-paper shadow-sm">
                <div className="flex items-center justify-between bg-magenta/5 px-5 py-3">
                  <p className="text-sm font-semibold text-ink">
                    {d.orders?.brand?.first_name} {d.orders?.brand?.last_name} ↔{" "}
                    {d.orders?.creative?.first_name} {d.orders?.creative?.last_name}
                  </p>
                  <span className="rounded-full bg-magenta/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-magenta">
                    Ksh {d.orders?.amount_kes.toLocaleString()}
                  </span>
                </div>
                <div className="p-5">
                  <p className="text-xs text-ink/40">
                    Raised by {d.raised_by?.first_name} {d.raised_by?.last_name}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-ink/70">{d.reason}</p>
                  <form action={resolve} className="mt-5 space-y-3">
                    <textarea
                      name="notes"
                      rows={2}
                      placeholder="Resolution notes…"
                      className="w-full rounded-lg border border-line bg-transparent px-4 py-2.5 text-sm text-ink outline-none focus:border-brand"
                    />
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="submit"
                        name="resolution"
                        value="resolved_released"
                        className="rounded-full bg-grad-brand px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-paper shadow-sm transition hover:opacity-90"
                      >
                        Release to Creative
                      </button>
                      <button
                        type="submit"
                        name="resolution"
                        value="resolved_refunded"
                        className="rounded-full border border-magenta/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-magenta transition hover:bg-magenta/5"
                      >
                        Refund Brand
                      </button>
                      <button
                        type="submit"
                        name="resolution"
                        value="resolved_split"
                        className="rounded-full border border-line px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-ink/70 transition hover:border-ink"
                      >
                        Mark as Split (manual)
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            );
          })}
          {!open.length && <p className="text-sm text-ink/40">No open disputes.</p>}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-ink/50">
          Resolved ({resolved.length})
        </h2>
        <div className="mt-4 space-y-2">
          {resolved.map((d) => (
            <div key={d.id} className="flex items-center justify-between rounded-xl border border-line bg-paper px-4 py-3 text-sm shadow-sm">
              <span className="text-ink/70">{d.reason}</span>
              <span className="rounded-full bg-green/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-green">
                {d.status.replace("_", " ")}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
