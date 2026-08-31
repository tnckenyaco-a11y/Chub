import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { notifyOrderPaid, notifyPayoutCompleted } from "@/lib/email/notify";

// IntaSend collection (STK push) event — has invoice_id + state + challenge.
type CollectionEvent = {
  invoice_id: string;
  state: "PENDING" | "PROCESSING" | "COMPLETE" | "FAILED";
  api_ref: string | null;
  challenge?: string;
};

// IntaSend send-money (payout) event — has tracking_id + status, no api_ref.
type PayoutEvent = {
  tracking_id: string;
  status: string;
  challenge?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as CollectionEvent | PayoutEvent;

  if (body.challenge !== process.env.INTASEND_WEBHOOK_CHALLENGE) {
    return NextResponse.json({ error: "Invalid challenge" }, { status: 401 });
  }

  const supabase = createServiceClient();

  if ("invoice_id" in body) {
    await handleCollectionEvent(supabase, body);
  } else if ("tracking_id" in body) {
    await handlePayoutEvent(supabase, body);
  }

  return NextResponse.json({ ok: true });
}

async function handleCollectionEvent(
  supabase: ReturnType<typeof createServiceClient>,
  event: CollectionEvent
) {
  const orderId = event.api_ref;
  if (!orderId) return;

  const status =
    event.state === "COMPLETE" ? "successful" : event.state === "FAILED" ? "failed" : "pending";

  const { data: existing } = await supabase
    .from("payments")
    .select("id")
    .eq("order_id", orderId)
    .eq("kind", "collection")
    .maybeSingle();

  const { data: order } = await supabase
    .from("orders")
    .select("amount_kes")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return;

  if (existing) {
    await supabase
      .from("payments")
      .update({ status, provider_ref: event.invoice_id, raw_callback: event })
      .eq("id", existing.id);
  } else {
    await supabase.from("payments").insert({
      order_id: orderId,
      kind: "collection",
      status,
      amount_kes: order.amount_kes,
      provider_ref: event.invoice_id,
      raw_callback: event,
    });
  }

  if (status === "successful") {
    const { data: updated } = await supabase
      .from("orders")
      .update({ status: "paid" })
      .eq("id", orderId)
      .eq("status", "pending_payment")
      .select("id")
      .maybeSingle();
    if (updated) await notifyOrderPaid(orderId);
  }
}

async function handlePayoutEvent(
  supabase: ReturnType<typeof createServiceClient>,
  event: PayoutEvent
) {
  const status =
    event.status === "COMPLETE"
      ? "successful"
      : event.status === "FAILED"
        ? "failed"
        : "pending";

  const { data: updated } = await supabase
    .from("payments")
    .update({ status, raw_callback: event })
    .eq("provider_ref", event.tracking_id)
    .eq("kind", "payout")
    .select("order_id")
    .maybeSingle();

  if (status === "successful" && updated) await notifyPayoutCompleted(updated.order_id);
}
