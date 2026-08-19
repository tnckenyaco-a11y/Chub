import { createServiceClient } from "@/lib/supabase/service";
import { initiatePayout } from "@/lib/payments/provider";

// Called once an order reaches 'completed' (brand approval or admin dispute
// resolution) to push the M-Pesa payout to the creative and record it.
export async function releasePayoutForOrder(orderId: string) {
  const service = createServiceClient();

  const { data: order } = await service
    .from("orders")
    .select("id, amount_kes, creative_id")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return;

  const { data: existingPayout } = await service
    .from("payments")
    .select("id")
    .eq("order_id", orderId)
    .eq("kind", "payout")
    .maybeSingle();
  if (existingPayout) return; // already released

  // If a Nyx Advance was disbursed against this order, the advanced portion
  // is settled here rather than paid out again — the creative already has
  // it. This is bookkeeping only: no money actually moves back to the
  // lending partner through this codebase, since there's no partner payment
  // rail integrated yet. Reconciling that transfer is a manual, outside-the-app
  // step for now (see the admin Advance Requests page).
  const { data: advance } = await service
    .from("advance_requests")
    .select("id, approved_amount_kes")
    .eq("order_id", orderId)
    .eq("status", "disbursed")
    .maybeSingle();

  const advancedAmount = advance?.approved_amount_kes ?? 0;
  const payoutAmount = Math.max(0, order.amount_kes - advancedAmount);

  if (advance) {
    await service
      .from("advance_requests")
      .update({ status: "repaid", repaid_at: new Date().toISOString() })
      .eq("id", advance.id);
  }

  if (payoutAmount === 0) {
    await service.from("payments").insert({
      order_id: order.id,
      kind: "payout",
      status: "successful",
      amount_kes: 0,
      raw_callback: { note: "Fully covered by a Nyx Advance; nothing left to pay out." },
    });
    return;
  }

  const { data: creative } = await service
    .from("profiles")
    .select("phone, first_name, last_name")
    .eq("id", order.creative_id)
    .maybeSingle();

  if (!creative?.phone) {
    await service.from("payments").insert({
      order_id: order.id,
      kind: "payout",
      status: "pending",
      amount_kes: payoutAmount,
      raw_callback: { note: "Creative has no phone number on file; payout not yet initiated." },
    });
    return;
  }

  try {
    const result = await initiatePayout({
      amountKes: payoutAmount,
      phoneNumber: creative.phone,
      name: `${creative.first_name} ${creative.last_name}`.trim(),
      narrative: `Nyx Creators Hub order ${order.id}`,
    });

    // IntaSend reports an immediate status; Daraja's B2C is always fully
    // async (syncStatus is null), so it stays "pending" here and the
    // b2c-result/b2c-timeout callback routes update it once Safaricom
    // actually reports an outcome.
    await service.from("payments").insert({
      order_id: order.id,
      kind: "payout",
      status: result.syncStatus ?? "pending",
      amount_kes: payoutAmount,
      provider_ref: result.providerRef,
      raw_callback: result,
    });
  } catch (err) {
    await service.from("payments").insert({
      order_id: order.id,
      kind: "payout",
      status: "failed",
      amount_kes: payoutAmount,
      raw_callback: { error: err instanceof Error ? err.message : String(err) },
    });
  }
}
