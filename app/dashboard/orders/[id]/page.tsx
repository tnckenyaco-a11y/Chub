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

  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, amount_kes, status, created_at, brand_id, creative_id, service_packages(title, services(title)), proposals(project_id, projects(title))"
    )
    .eq("id", id)
    .maybeSingle();

  if (!order || (order.brand_id !== profile.id && order.creative_id !== profile.id)) notFound();

  const [{ data: payments }, { data: dispute }, { data: reviews }, { data: parties }] = await Promise.all([
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
  ]);

  const partyById = new Map((parties ?? []).map((p) => [p.id, p]));
  const brandProfile = partyById.get(order.brand_id);
  const creativeProfile = partyById.get(order.creative_id);

  const isBrand = order.brand_id === profile.id;
  const context = order.service_packages
    ? `${order.service_packages.services?.title} — ${order.service_packages.title}`
    : order.proposals?.projects?.title;

  const startWork = markInProgress.bind(null, id);
  const deliver = markDelivered.bind(null, id);
  const release = approveAndRelease.bind(null, id);
  const dispute_ = raiseDispute.bind(null, id);
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
          M-Pesa prompt sent — check your phone to complete payment. This page updates once IntaSend
          confirms it.
        </p>
      )}
      {error && (
        <p className="mt-6 rounded-lg border border-magenta/40 bg-magenta/10 px-4 py-3 text-sm text-magenta">
          {error}
        </p>
      )}

      {order.status === "pending_payment" && (
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
            <summary className="cursor-pointer text-xs uppercase tracking-wide text-ink/40 hover:text-magenta">
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
