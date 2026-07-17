import { createServiceClient } from "@/lib/supabase/service";
import { initiatePayout, normalizeKenyanPhone } from "@/lib/payments/intasend";

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
      amount_kes: order.amount_kes,
      raw_callback: { note: "Creative has no phone number on file; payout not yet initiated." },
    });
    return;
  }

  try {
    const payout = await initiatePayout({
      amountKes: order.amount_kes,
      phoneNumber: normalizeKenyanPhone(creative.phone),
      name: `${creative.first_name} ${creative.last_name}`.trim(),
      narrative: `Nyx Creators Hub order ${order.id}`,
    });

    const txStatus = payout.transactions?.[0]?.status;
    const status = txStatus === "COMPLETE" ? "successful" : txStatus === "FAILED" ? "failed" : "pending";

    await service.from("payments").insert({
      order_id: order.id,
      kind: "payout",
      status,
      amount_kes: order.amount_kes,
      provider_ref: payout.tracking_id,
      raw_callback: payout,
    });
  } catch (err) {
    await service.from("payments").insert({
      order_id: order.id,
      kind: "payout",
      status: "failed",
      amount_kes: order.amount_kes,
      raw_callback: { error: err instanceof Error ? err.message : String(err) },
    });
  }
}
