import { requireAdmin } from "@/lib/require-admin";
import { reviewAdvance, confirmDisbursed } from "@/app/admin/advances/actions";

const STATUS_STYLE: Record<string, string> = {
  requested: "bg-ink/8 text-ink/55",
  approved: "bg-green/10 text-green",
  partial: "bg-volt/10 text-volt",
  declined: "bg-magenta/10 text-magenta",
  disbursed: "bg-brand/10 text-brand",
  repaid: "bg-green/10 text-green",
};

const REASON_OPTIONS = [
  { value: "below_eligibility_threshold", label: "Below eligibility threshold" },
  { value: "requested_amount_too_high", label: "Requested amount too high" },
  { value: "gig_risk_concern", label: "Risk concern with this gig" },
  { value: "other", label: "Other" },
];

export default async function AdminAdvancesPage() {
  const { supabase } = await requireAdmin();

  const { data: advances } = await supabase
    .from("advance_requests")
    .select(
      "id, status, requested_amount_kes, approved_amount_kes, reason_code, reason_note, disbursed_reference, created_at, creative:profiles!advance_requests_creative_id_fkey(first_name, last_name), orders(amount_kes, service_packages(title, services(title)), proposals(projects(title)))"
    )
    .order("created_at", { ascending: false });

  const needsReview = advances?.filter((a) => a.status === "requested") ?? [];
  const reviewed = advances?.filter((a) => a.status !== "requested") ?? [];

  const renderAdvance = (a: NonNullable<typeof advances>[number]) => {
    const context = a.orders?.service_packages
      ? `${a.orders.service_packages.services?.title} — ${a.orders.service_packages.title}`
      : (a.orders?.proposals?.projects?.title ?? "Order");
    const review = reviewAdvance.bind(null, a.id);
    const disburse = confirmDisbursed.bind(null, a.id);

    return (
      <div key={a.id} className="rounded-2xl border border-line bg-paper p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-medium text-ink">
              {a.creative?.first_name} {a.creative?.last_name} · {context}
            </p>
            <p className="mt-0.5 text-xs text-ink/40">
              Requested Ksh {a.requested_amount_kes.toLocaleString()}
              {a.approved_amount_kes != null &&
                ` · Approved Ksh ${a.approved_amount_kes.toLocaleString()}`}
              {a.orders?.amount_kes != null &&
                ` · Gig total Ksh ${a.orders.amount_kes.toLocaleString()}`}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${
              STATUS_STYLE[a.status] ?? "bg-ink/5 text-ink/50"
            }`}
          >
            {a.status}
          </span>
        </div>

        {(a.reason_code || a.reason_note) && (
          <p className="mt-2 text-xs text-ink/50">
            {a.reason_code &&
              (REASON_OPTIONS.find((r) => r.value === a.reason_code)?.label ?? a.reason_code)}
            {a.reason_note && ` — ${a.reason_note}`}
          </p>
        )}
        {a.disbursed_reference && (
          <p className="mt-2 text-xs text-ink/50">Disbursed ref: {a.disbursed_reference}</p>
        )}

        {a.status === "requested" && (
          <form action={review} className="mt-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="number"
                name="approved_amount_kes"
                placeholder="Partial amount (Ksh)"
                min={1}
                max={a.requested_amount_kes - 1}
                className="rounded-lg border border-line bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-brand"
              />
              <select
                name="reason_code"
                defaultValue=""
                className="rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink"
              >
                <option value="">Reason (for partial/decline)</option>
                {REASON_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              name="reason_note"
              rows={2}
              placeholder="Note (optional)"
              className="w-full rounded-lg border border-line bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-brand"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                name="decision"
                value="approved"
                className="rounded-full bg-green/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-green"
              >
                Approve Full
              </button>
              <button
                type="submit"
                name="decision"
                value="partial"
                className="rounded-full bg-volt/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-volt"
              >
                Approve Partial
              </button>
              <button
                type="submit"
                name="decision"
                value="declined"
                className="rounded-full bg-magenta/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-magenta"
              >
                Decline
              </button>
            </div>
          </form>
        )}

        {(a.status === "approved" || a.status === "partial") && (
          <form action={disburse} className="mt-4 flex flex-wrap items-center gap-2">
            <input
              type="text"
              name="disbursed_reference"
              required
              placeholder="Partner disbursement reference"
              className="flex-1 rounded-lg border border-line bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-brand"
            />
            <button
              type="submit"
              className="rounded-full bg-grad-brand px-4 py-2 text-xs font-semibold uppercase tracking-wide text-paper"
            >
              Confirm Disbursed
            </button>
          </form>
        )}
      </div>
    );
  };

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Advance Requests</h1>
      <p className="mt-2 text-sm text-ink/50">
        Standing in for the lending partner&apos;s review until a real partner portal exists.
        &quot;Confirm Disbursed&quot; records that the partner has already sent funds outside
        this system — it does not move money itself.
      </p>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/50">
          Needs review ({needsReview.length})
        </h2>
        <div className="mt-4 space-y-4">
          {needsReview.map(renderAdvance)}
          {!needsReview.length && <p className="text-sm text-ink/40">Nothing to review.</p>}
        </div>
      </section>

      <section className="mt-10 border-t border-line pt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/50">Reviewed</h2>
        <div className="mt-4 space-y-4">
          {reviewed.map(renderAdvance)}
          {!reviewed.length && <p className="text-sm text-ink/40">No history yet.</p>}
        </div>
      </section>
    </div>
  );
}
