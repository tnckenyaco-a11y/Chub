import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";
import {
  approveAndRelease,
  markDelivered,
  markInProgress,
  raiseDispute,
  submitReview,
} from "@/app/dashboard/orders/actions";
import { requestAdvance } from "@/app/dashboard/advances/actions";
import { getAdvanceEligibility } from "@/lib/finance/advance-eligibility";
import { getSitePage } from "@/lib/site-pages";
import { expireStalePayments } from "@/lib/payments/expire-stale";

const MANUAL_PAYMENTS = process.env.PAYMENT_PROVIDER === "manual";

type ManualPaymentInstructions = { mpesa_number: string; note: string };

const ADVANCE_REASON_LABEL: Record<string, string> = {
  below_eligibility_threshold: "Below eligibility threshold",
  requested_amount_too_high: "Requested amount too high",
  gig_risk_concern: "Risk concern with this gig",
  other: "Other",
};

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ checkout?: string; error?: string }>;
}) {
  const profile = await requireProfile();
  const { id } = await params;
  const { checkout, error } = await searchParams;
  const supabase = await createClient();

  await expireStalePayments();

  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, amount_kes, status, created_at, brand_id, creative_id, service_packages(title, services(title)), proposals(project_id, projects(title))"
    )
    .eq("id", id)
    .maybeSingle();

  if (!order || (order.brand_id !== profile.id && order.creative_id !== profile.id)) notFound();

  const [{ data: payments }, { data: dispute }, { data: reviews }, { data: parties }, { data: advance }] =
    await Promise.all([
      supabase
        .from("payments")
        .select("kind, status, amount_kes, created_at")
        .eq("order_id", id)
        .order("created_at"),
      supabase.from("disputes").select("reason, status, admin_notes").eq("order_id", id).maybeSingle(),
      supabase.from("reviews").select("reviewer_id").eq("order_id", id),
      // Joining orders -> profiles directly hits RLS ("owner or admin only"), so
      // counterparty names come from public_profiles instead — same as everywhere else.
      supabase
        .from("public_profiles")
        .select("id, first_name, last_name")
        .in("id", [order.brand_id, order.creative_id]),
      supabase
        .from("advance_requests")
        .select("status, requested_amount_kes, approved_amount_kes, reason_code, reason_note")
        .eq("order_id", id)
        .neq("status", "declined")
        .maybeSingle(),
    ]);

  const partyById = new Map((parties ?? []).map((p) => [p.id, p]));
  const brandProfile = partyById.get(order.brand_id);
  const creativeProfile = partyById.get(order.creative_id);

  const isBrand = order.brand_id === profile.id;
  const context = order.service_packages
    ? `${order.service_packages.services?.title} — ${order.service_packages.title}`
    : order.proposals?.projects?.title;

  const advanceEligibility =
    !isBrand && !advance && ["paid", "in_progress", "delivered"].includes(order.status)
      ? await getAdvanceEligibility(supabase, profile.id, id)
      : null;

  const manualInstructions =
    MANUAL_PAYMENTS && isBrand && order.status === "pending_payment"
      ? (await getSitePage<ManualPaymentInstructions>("manual_payment_instructions"))?.content
      : null;

  const startWork = markInProgress.bind(null, id);
  const deliver = markDelivered.bind(null, id);
  const release = approveAndRelease.bind(null, id);
  const dispute_ = raiseDispute.bind(null, id);
  const request_ = requestAdvance.bind(null, id);
  const review = submitReview.bind(null, id);
  const alreadyReviewed = reviews?.some((r) => r.reviewer_id === profile.id);

  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">
        {order.status.replace("_", " ")}
      </p>
      <h1 className="font-display mt-2 text-3xl text-ink">
        {context ?? "Order"}
      </h1>
      <p className="mt-2 text-sm text-ink/60">
        {isBrand ? "Creative" : "Brand"}:{" "}
        {isBrand
          ? `${creativeProfile?.first_name ?? ""} ${creativeProfile?.last_name ?? ""}`
          : `${brandProfile?.first_name ?? ""} ${brandProfile?.last_name ?? ""}`}{" "}
        · Ksh {order.amount_kes.toLocaleString()}
      </p>

      {checkout && (
        <p className="mt-6 rounded-lg border border-brand/40 bg-brand/10 px-4 py-3 text-sm text-brand">
          {MANUAL_PAYMENTS
            ? "Send payment as instructed below — we'll confirm once it's received."
            : "M-Pesa prompt sent — check your phone to complete payment. This page updates once IntaSend confirms it."}
        </p>
      )}
      {error && (
        <p className="mt-6 rounded-lg border border-magenta/40 bg-magenta/10 px-4 py-3 text-sm text-magenta">
          {error}
        </p>
      )}

      {order.status === "pending_payment" && manualInstructions && (
        <div className="mt-8 rounded-2xl border border-brand/30 bg-brand/5 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">
            Send payment via M-Pesa
          </p>
          <p className="font-display mt-2 text-xl text-ink">{manualInstructions.mpesa_number}</p>
          <p className="mt-2 text-sm text-ink/60">{manualInstructions.note}</p>
        </div>
      )}
      {order.status === "pending_payment" && !manualInstructions && (
        <p className="mt-8 text-sm text-ink/50">Waiting for M-Pesa payment confirmation…</p>
      )}

      {order.status === "paid" && !isBrand && (
        <form action={startWork} className="mt-8">
          <button
            type="submit"
            className="rounded-full bg-grad-brand px-6 py-3 text-sm font-semibold uppercase tracking-wide text-paper shadow-sm transition hover:opacity-90"
          >
            Start Work
          </button>
        </form>
      )}

      {order.status === "in_progress" && !isBrand && (
        <form action={deliver} className="mt-8">
          <button
            type="submit"
            className="rounded-full bg-grad-brand px-6 py-3 text-sm font-semibold uppercase tracking-wide text-paper shadow-sm transition hover:opacity-90"
          >
            Mark Delivered
          </button>
        </form>
      )}

      {order.status === "delivered" && isBrand && (
        <form action={release} className="mt-8">
          <button
            type="submit"
            className="rounded-full bg-grad-brand px-6 py-3 text-sm font-semibold uppercase tracking-wide text-paper shadow-sm transition hover:opacity-90"
          >
            Approve &amp; Release Payment
          </button>
        </form>
      )}

      {payments && payments.length > 0 && (
        <div className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/50">Payments</h2>
          <div className="mt-3 space-y-2">
            {payments.map((p, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="capitalize text-ink/70">{p.kind}</span>
                <span className="text-ink/50">Ksh {p.amount_kes.toLocaleString()}</span>
                <span
                  className={
                    p.status === "successful"
                      ? "text-green"
                      : p.status === "failed"
                        ? "text-magenta"
                        : "text-ink/40"
                  }
                >
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {advance && (
        <div className="mt-10 rounded-2xl border border-brand/30 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">
            Nyx Advance — {advance.status.replace("_", " ")}
          </p>
          <p className="mt-2 text-sm text-ink/70">
            Requested Ksh {advance.requested_amount_kes.toLocaleString()}
            {advance.approved_amount_kes != null &&
              ` · Approved Ksh ${advance.approved_amount_kes.toLocaleString()}`}
          </p>
          {advance.reason_code && (
            <p className="mt-2 text-sm text-ink/50">
              Reason: {ADVANCE_REASON_LABEL[advance.reason_code] ?? advance.reason_code}
            </p>
          )}
          {advance.reason_note && (
            <p className="mt-1 text-sm text-ink/50">{advance.reason_note}</p>
          )}
        </div>
      )}

      {advanceEligibility?.eligible && (
        <details className="mt-10">
          <summary className="cursor-pointer text-xs uppercase tracking-wide text-ink/40 hover:text-brand">
            Request a Nyx Advance
          </summary>
          <form action={request_} className="mt-4 space-y-3">
            <p className="text-xs text-ink/50">
              Up to Ksh {advanceEligibility.maxAmountKes.toLocaleString()} available on this order.
            </p>
            <input
              type="number"
              name="amount_kes"
              required
              min={1}
              max={advanceEligibility.maxAmountKes}
              placeholder="Amount in Ksh"
              className="w-full rounded-lg border border-line bg-transparent px-4 py-2.5 text-sm text-ink outline-none focus:border-brand"
            />
            <button
              type="submit"
              className="rounded-full border border-brand/40 px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-brand"
            >
              Request Advance
            </button>
          </form>
        </details>
      )}

      {dispute ? (
        <div className="mt-10 rounded-2xl border border-magenta/40 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-magenta">
            Dispute — {dispute.status.replace("_", " ")}
          </p>
          <p className="mt-2 text-sm text-ink/70">{dispute.reason}</p>
          {dispute.admin_notes && (
            <p className="mt-2 text-sm text-ink/50">Admin notes: {dispute.admin_notes}</p>
          )}
        </div>
      ) : (
        ["paid", "in_progress", "delivered"].includes(order.status) && (
          <details className="mt-10">
            <summary className="inline-flex w-fit list-none items-center rounded-full border border-magenta/40 px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-magenta transition hover:bg-magenta/10 [&::-webkit-details-marker]:hidden">
              Raise a dispute
            </summary>
            <form action={dispute_} className="mt-4 space-y-3">
              <textarea
                name="reason"
                required
                rows={3}
                placeholder="What went wrong?"
                className="w-full rounded-lg border border-line bg-transparent px-4 py-2.5 text-sm text-ink outline-none focus:border-magenta"
              />
              <button
                type="submit"
                className="rounded-full border border-magenta/40 px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-magenta"
              >
                Submit Dispute
              </button>
            </form>
          </details>
        )
      )}

      {order.status === "completed" && !alreadyReviewed && (
        <form action={review} className="mt-10 space-y-4 rounded-2xl border border-line p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/50">
            Leave a Review
          </h2>
          <RatingField name="overall_rating" label="Overall" required />
          <RatingField name="quality_rating" label="Quality" />
          <RatingField name="communication_rating" label="Communication" />
          <RatingField name="timeliness_rating" label="Timeliness" />
          <RatingField name="value_rating" label="Value" />
          <textarea
            name="comment"
            rows={3}
            placeholder="Share details of your experience…"
            className="w-full rounded-lg border border-line bg-transparent px-4 py-2.5 text-sm text-ink outline-none focus:border-brand"
          />
          <button
            type="submit"
            className="rounded-full bg-grad-brand px-6 py-3 text-sm font-semibold uppercase tracking-wide text-paper shadow-sm transition hover:opacity-90"
          >
            Submit Review
          </button>
        </form>
      )}
    </div>
  );
}

function RatingField({
  name,
  label,
  required,
}: {
  name: string;
  label: string;
  required?: boolean;
}) {
  return (
    <label className="flex items-center justify-between">
      <span className="text-xs text-ink/50">
        {label}
        {required ? " *" : ""}
      </span>
      <select
        name={name}
        required={required}
        defaultValue={required ? "5" : ""}
        className="rounded-md border border-line bg-paper px-2 py-1 text-xs text-ink"
      >
        {!required && <option value="">—</option>}
        {[1, 2, 3, 4, 5].map((n) => (
          <option key={n} value={n}>
            {n} ★
          </option>
        ))}
      </select>
    </label>
  );
}
