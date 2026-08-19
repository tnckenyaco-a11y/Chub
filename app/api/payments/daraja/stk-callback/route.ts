import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

// Daraja's STK push callback shape — see
// lib/payments/daraja.ts for where CheckoutRequestID first appears (the
// synchronous response to our own initiating request). Nothing here echoes
// our order id, so correlation only works because app/checkout/actions.ts
// pre-inserted a `payments` row keyed by provider_ref = CheckoutRequestID.
type StkCallbackBody = {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: { Item: { Name: string; Value: string | number }[] };
    };
  };
};

// Safaricom expects this exact acknowledgement shape back regardless of what
// we did internally — it isn't a general-purpose API response.
const ACK = { ResultCode: 0, ResultDesc: "Accepted" };

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as StkCallbackBody | null;
  const callback = body?.Body?.stkCallback;
  if (!callback) return NextResponse.json(ACK);

  const supabase = createServiceClient();
  const status = callback.ResultCode === 0 ? "successful" : "failed";

  const { data: payment } = await supabase
    .from("payments")
    .update({ status, raw_callback: callback })
    .eq("provider_ref", callback.CheckoutRequestID)
    .eq("kind", "collection")
    .select("order_id")
    .maybeSingle();

  if (payment && status === "successful") {
    await supabase
      .from("orders")
      .update({ status: "paid" })
      .eq("id", payment.order_id)
      .eq("status", "pending_payment");
  }

  return NextResponse.json(ACK);
}
