// Switch point between payment providers. Collection and payout are
// switched independently — a provider can be enabled for one and not the
// other (e.g. IntaSend's live account here has collection approved but
// disbursement/payout not yet enabled, so payouts stay manual until that's
// separately approved). COLLECTION_PROVIDER/PAYOUT_PROVIDER each default to
// "intasend"; set either to "daraja" once Daraja is verified, or "manual" to
// collect/disburse by hand over personal M-Pesa.
//
// The providers don't behave identically after initiation: IntaSend's
// collection webhook echoes back our own order id (api_ref), so nothing
// needs to be written here. Daraja's callbacks and manual confirmations only
// ever carry Safaricom-generated or locally-generated IDs, so callers on
// those paths must pre-insert a pending `payments` row keyed by
// `providerRef` themselves — see app/checkout/actions.ts and
// lib/payments/release-payout.ts.
import * as intasend from "@/lib/payments/intasend";
import * as daraja from "@/lib/payments/daraja";
import { normalizeKenyanPhone } from "@/lib/payments/phone";

function resolveProvider(envVar: string | undefined) {
  return envVar === "daraja" ? "daraja" : envVar === "manual" ? "manual" : "intasend";
}

const COLLECTION_PROVIDER = resolveProvider(process.env.COLLECTION_PROVIDER ?? process.env.PAYMENT_PROVIDER);
const PAYOUT_PROVIDER = resolveProvider(process.env.PAYOUT_PROVIDER ?? process.env.PAYMENT_PROVIDER);

export type CollectionInitiation = {
  provider: "intasend" | "daraja" | "manual";
  providerRef: string;
  // Set when the payer must be redirected to finish paying (card entry can't
  // happen over an API call, unlike M-Pesa's STK push) — the caller should
  // redirect the browser here instead of straight to the order page.
  checkoutUrl?: string;
};

export async function initiateCollection(params: {
  amountKes: number;
  phoneNumber: string;
  email: string;
  orderId: string;
  name: string;
  // "mpesa" (default) pushes an STK prompt to the phone; "card" is only
  // supported on IntaSend and requires redirectUrl.
  method?: "mpesa" | "card";
  redirectUrl?: string;
}): Promise<CollectionInitiation> {
  if (params.method === "card") {
    if (COLLECTION_PROVIDER !== "intasend") {
      throw new Error("Card payments are only available via IntaSend.");
    }
    if (!params.redirectUrl) {
      throw new Error("redirectUrl is required for card checkout.");
    }
    const res = await intasend.initiateCardCheckout({
      amountKes: params.amountKes,
      email: params.email,
      apiRef: params.orderId,
      name: params.name,
      redirectUrl: params.redirectUrl,
    });
    return { provider: "intasend", providerRef: res.id ?? res.url, checkoutUrl: res.url };
  }

  const phoneNumber = normalizeKenyanPhone(params.phoneNumber);

  if (COLLECTION_PROVIDER === "manual") {
    return { provider: "manual", providerRef: crypto.randomUUID() };
  }

  if (COLLECTION_PROVIDER === "daraja") {
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
  provider: "intasend" | "daraja" | "manual";
  providerRef: string;
  // IntaSend's collection API reports an immediate transaction status;
  // Daraja's B2C and manual payouts are always async (wait for someone —
  // Safaricom or an admin — to confirm), so this is null on those paths and
  // the payments row must be inserted as "pending" until confirmed.
  syncStatus: "pending" | "successful" | "failed" | null;
};

export async function initiatePayout(params: {
  amountKes: number;
  phoneNumber: string;
  name: string;
  narrative: string;
}): Promise<PayoutInitiation> {
  const phoneNumber = normalizeKenyanPhone(params.phoneNumber);

  if (PAYOUT_PROVIDER === "manual") {
    return { provider: "manual", providerRef: crypto.randomUUID(), syncStatus: null };
  }

  if (PAYOUT_PROVIDER === "daraja") {
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
