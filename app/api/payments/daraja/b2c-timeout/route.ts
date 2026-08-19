import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

// Safaricom requires a QueueTimeOutURL registered alongside ResultURL for
// every B2C request, even though a timeout should be rare — if the payout
// request itself never got a definitive result, it counts as failed for our
// purposes; a human can re-check the actual outcome via the admin orders view.
type B2CTimeoutBody = {
  Result: {
    ResultCode: number;
    ResultDesc: string;
    ConversationID: string;
  };
};

const ACK = { ResultCode: 0, ResultDesc: "Accepted" };

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as B2CTimeoutBody | null;
  const result = body?.Result;
  if (!result) return NextResponse.json(ACK);

  await createServiceClient()
    .from("payments")
    .update({ status: "failed", raw_callback: result })
    .eq("provider_ref", result.ConversationID)
    .eq("kind", "payout");

  return NextResponse.json(ACK);
}
