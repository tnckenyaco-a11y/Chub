import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { notifyPayoutCompleted } from "@/lib/email/notify";
import { verifyDarajaCallback } from "@/lib/payments/verify-daraja-callback";

// Daraja's B2C result callback shape. Correlation is by ConversationID,
// pre-inserted as provider_ref by lib/payments/release-payout.ts right after
// the synchronous acknowledgement — B2C has no synchronous status at all.
type B2CResultBody = {
  Result: {
    ResultType: number;
    ResultCode: number;
    ResultDesc: string;
    OriginatorConversationID: string;
    ConversationID: string;
    TransactionID?: string;
    ResultParameters?: { ResultParameter: { Key: string; Value: string | number }[] };
  };
};

const ACK = { ResultCode: 0, ResultDesc: "Accepted" };

export async function POST(request: Request) {
  if (!verifyDarajaCallback(request)) return NextResponse.json(ACK);

  const body = (await request.json().catch(() => null)) as B2CResultBody | null;
  const result = body?.Result;
  if (!result) return NextResponse.json(ACK);

  const status = result.ResultCode === 0 ? "successful" : "failed";

  const { data: updated } = await createServiceClient()
    .from("payments")
    .update({ status, raw_callback: result })
    .eq("provider_ref", result.ConversationID)
    .eq("kind", "payout")
    .select("order_id")
    .maybeSingle();

  if (status === "successful" && updated) await notifyPayoutCompleted(updated.order_id);

  return NextResponse.json(ACK);
}
