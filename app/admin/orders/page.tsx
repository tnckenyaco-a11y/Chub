import { createClient } from "@/lib/supabase/server";
import {
  confirmManualPayment,
  confirmManualPayout,
  setOrderStatus,
  setPaymentStatus,
  deleteOrder,
  deletePayment,
} from "@/app/admin/orders/actions";
import { SubmitButton } from "@/components/submit-button";
import { AutoSubmitSelect } from "@/components/auto-submit-select";
import { formatDate } from "@/lib/format";
import { expireStalePayments } from "@/lib/payments/expire-stale";

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

const ORDER_STATUSES = [
  "pending_payment",
  "paid",
  "in_progress",
  "delivered",
  "completed",
  "disputed",
  "refunded",
  "cancelled",
] as const;

const PAYMENT_STATUSES = ["pending", "successful", "failed"] as const;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();

  await expireStalePayments();

  let query = supabase
    .from("orders")
    .select(
      "id, amount_kes, status, created_at, brand:profiles!orders_brand_id_fkey(first_name, last_name), creative:profiles!orders_creative_id_fkey(first_name, last_name), service_packages(title, services(title)), proposals(projects(title)), payments(id, kind, status, provider_ref)"
    )
    .order("created_at", { ascending: false });

  if (status && (ORDER_STATUSES as readonly string[]).includes(status)) {
    query = query.eq("status", status as (typeof ORDER_STATUSES)[number]);
  }

  const { data: orders } = await query;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl text-ink">Orders &amp; Payments</h1>
        <a
          href="/admin/orders/export"
          className="rounded-full border border-line px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ink/70 transition hover:border-brand hover:text-brand"
        >
          Export CSV
        </a>
      </div>

      <form className="mt-6">
        <AutoSubmitSelect
          name="status"
          defaultValue={status ?? ""}
          className="rounded-lg border border-line bg-paper px-4 py-2.5 text-sm text-ink outline-none focus:border-brand"
          options={[
            { value: "", label: "All statuses" },
            ...ORDER_STATUSES.map((s) => ({ value: s, label: s.replace("_", " ") })),
          ]}
        />
      </form>

      <div className="mt-8 space-y-3">
        {orders?.map((o) => {
          const context = o.service_packages
            ? `${o.service_packages.services?.title} — ${o.service_packages.title}`
            : o.proposals?.projects?.title;

          return (
            <div key={o.id} className="rounded-2xl border border-line bg-paper p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-ink">
                    {o.brand?.first_name} {o.brand?.last_name} → {o.creative?.first_name}{" "}
                    {o.creative?.last_name}
                  </p>
                  {context && <p className="mt-0.5 text-xs text-ink/50">{context}</p>}
                  <p className="mt-1 text-[11px] text-ink/30">
                    #{o.id.slice(0, 8)} · {formatDate(o.created_at)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${
                    statusStyle[o.status] ?? "bg-ink/5 text-ink/50"
                  }`}
                >
                  {o.status.replace("_", " ")}
                </span>
              </div>
              <p className="mt-1.5 text-xs text-ink/40">Ksh {o.amount_kes.toLocaleString()}</p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <form action={setOrderStatus.bind(null, o.id)} className="flex items-center gap-1.5">
                  <select
                    name="status"
                    defaultValue={o.status}
                    className="rounded-md border border-line bg-transparent px-2 py-1 text-xs text-ink outline-none focus:border-brand"
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                  <SubmitButton className="rounded-md border border-line px-2 py-1 text-[11px] uppercase text-ink/70 hover:border-brand hover:text-brand">
                    Save
                  </SubmitButton>
                </form>
                <form action={deleteOrder.bind(null, o.id)}>
                  <SubmitButton
                    pendingText="Deleting…"
                    confirmMessage={`Permanently delete this order (Ksh ${o.amount_kes.toLocaleString()}) and all its payments, reviews, and disputes? This cannot be undone.`}
                    className="rounded-md border border-magenta/40 px-2 py-1 text-[11px] uppercase text-magenta hover:bg-magenta/10"
                  >
                    Delete order
                  </SubmitButton>
                </form>
              </div>

              {o.payments && o.payments.length > 0 && (
                <div className="mt-3 space-y-2 border-t border-line/60 pt-3">
                  {o.payments.map((p) => (
                    <div key={p.id} className="flex flex-wrap items-center gap-2 text-xs">
                      <span
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
                      <form
                        action={setPaymentStatus.bind(null, p.id)}
                        className="flex items-center gap-1.5"
                      >
                        <select
                          name="status"
                          defaultValue={p.status}
                          className="rounded-md border border-line bg-transparent px-1.5 py-0.5 text-[11px] text-ink outline-none focus:border-brand"
                        >
                          {PAYMENT_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <SubmitButton className="rounded-md border border-line px-2 py-0.5 text-[11px] uppercase text-ink/70 hover:border-brand hover:text-brand">
                          Save
                        </SubmitButton>
                      </form>
                      <form action={deletePayment.bind(null, p.id)}>
                        <SubmitButton
                          pendingText="Deleting…"
                          confirmMessage="Permanently delete this payment record? This cannot be undone."
                          className="rounded-md border border-magenta/40 px-2 py-0.5 text-[11px] uppercase text-magenta hover:bg-magenta/10"
                        >
                          Delete
                        </SubmitButton>
                      </form>
                    </div>
                  ))}
                  {o.payments.some((p) => p.kind === "collection" && p.status === "pending") && (
                    <form action={confirmManualPayment.bind(null, o.id)}>
                      <SubmitButton className="rounded-full border border-brand/40 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand hover:bg-brand/10">
                        Mark payment received
                      </SubmitButton>
                    </form>
                  )}
                  {o.payments.some((p) => p.kind === "payout" && p.status === "pending") && (
                    <form action={confirmManualPayout.bind(null, o.id)}>
                      <SubmitButton className="rounded-full border border-brand/40 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand hover:bg-brand/10">
                        Mark payout sent
                      </SubmitButton>
                    </form>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {!orders?.length && <p className="text-sm text-ink/40">No orders yet.</p>}
      </div>
    </div>
  );
}
