// Single switch point between payment providers. Defaults to IntaSend (the
// one with working, tested credentials today) so the live app keeps
// functioning until Daraja has been verified with real credentials — set
// PAYMENT_PROVIDER=daraja once that's confirmed.
//
// The two providers don't behave identically after initiation: IntaSend's
// collection webhook echoes back our own order id (api_ref), so nothing
// needs to be written here. Daraja's callbacks only ever carry
// Safaricom-generated IDs, so callers on the Daraja path must pre-insert a
// pending `payments` row keyed by `providerRef` themselves — see
// app/checkout/actions.ts and lib/payments/release-payout.ts.
import * as intasend from "@/lib/payments/intasend";
import * as daraja from "@/lib/payments/daraja";
import { normalizeKenyanPhone } from "@/lib/payments/phone";

const PROVIDER = process.env.PAYMENT_PROVIDER === "daraja" ? "daraja" : "intasend";

export type CollectionInitiation = {
  provider: "intasend" | "daraja";
  providerRef: string;
};

export async function initiateCollection(params: {
  amountKes: number;
  phoneNumber: string;
  email: string;
  orderId: string;
  name: string;
}): Promise<CollectionInitiation> {
  const phoneNumber = normalizeKenyanPhone(params.phoneNumber);

  if (PROVIDER === "daraja") {
    const res = await daraja.initiateStkPush({
      amountKes: params.amountKes,
      phoneNumber,
      accountReference: params.orderId,
      transactionDesc: "Nyx Creators Hub order",
    });
    return { provider: "daraja", providerRef: res.CheckoutRequestID };
  }

  const res = await intasend.initiateSTKPush({
    amountKes: params.amountKes,
    phoneNumber,
    email: params.email,
    apiRef: params.orderId,
    name: params.name,
  });
  return { provider: "intasend", providerRef: res.invoice.invoice_id };
}

export type PayoutInitiation = {
  provider: "intasend" | "daraja";
  providerRef: string;
  // IntaSend's collection API reports an immediate transaction status;
  // Daraja's B2C is always fully async, so this is null on that path and
  // the payments row must be inserted as "pending" until the result callback.
  syncStatus: "pending" | "successful" | "failed" | null;
};

export async function initiatePayout(params: {
  amountKes: number;
  phoneNumber: string;
  name: string;
  narrative: string;
}): Promise<PayoutInitiation> {
  const phoneNumber = normalizeKenyanPhone(params.phoneNumber);

  if (PROVIDER === "daraja") {
    const res = await daraja.initiateB2C({
      amountKes: params.amountKes,
      phoneNumber,
      remarks: params.narrative,
    });
    return { provider: "daraja", providerRef: res.ConversationID, syncStatus: null };
  }

  const res = await intasend.initiatePayout({ ...params, phoneNumber });
  const txStatus = res.transactions?.[0]?.status;
  const syncStatus =
    txStatus === "COMPLETE" ? "successful" : txStatus === "FAILED" ? "failed" : "pending";
  return { provider: "intasend", providerRef: res.tracking_id, syncStatus };
}
