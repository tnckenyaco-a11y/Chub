export { normalizeKenyanPhone } from "@/lib/payments/phone";

const TEST_MODE = process.env.INTASEND_TEST_MODE !== "false";
const BASE_URL = TEST_MODE ? "https://sandbox.intasend.com" : "https://payment.intasend.com";

type CollectionResponse = {
  invoice: {
    id: string;
    invoice_id: string;
    state: string;
    value: string;
    account: string;
  };
};

export async function initiateSTKPush({
  amountKes,
  phoneNumber,
  email,
  apiRef,
  name,
}: {
  amountKes: number;
  phoneNumber: string;
  email: string;
  apiRef: string;
  name: string;
}) {
  const res = await fetch(`${BASE_URL}/api/v1/payment/collection/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      public_key: process.env.INTASEND_PUBLISHABLE_KEY,
      currency: "KES",
      method: "M-PESA",
      amount: amountKes,
      api_ref: apiRef,
      name,
      phone_number: phoneNumber,
      email,
    }),
  });

  if (!res.ok) {
    throw new Error(`IntaSend collection request failed: ${res.status} ${await res.text()}`);
  }

  return (await res.json()) as CollectionResponse;
}

type CheckoutResponse = {
  id?: string;
  url: string;
};

// Card payments need PCI-compliant card entry, so unlike STK push there's no
// API-only flow — IntaSend's hosted Checkout page handles that, and we
// redirect the payer there. It resolves back to `redirectUrl` on success,
// and (like STK push) the real confirmation still comes from the webhook.
export async function initiateCardCheckout({
  amountKes,
  email,
  apiRef,
  name,
  redirectUrl,
}: {
  amountKes: number;
  email: string;
  apiRef: string;
  name: string;
  redirectUrl: string;
}) {
  const [firstName, ...rest] = name.trim().split(/\s+/);

  const res = await fetch(`${BASE_URL}/api/v1/checkout/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      public_key: process.env.INTASEND_PUBLISHABLE_KEY,
      currency: "KES",
      method: "CARD-PAYMENT",
      amount: amountKes,
      api_ref: apiRef,
      email,
      first_name: firstName || undefined,
      last_name: rest.join(" ") || undefined,
      redirect_url: redirectUrl,
      card_tarrif: "BUSINESS-PAYS",
    }),
  });

  if (!res.ok) {
    throw new Error(`IntaSend checkout request failed: ${res.status} ${await res.text()}`);
  }

  return (await res.json()) as CheckoutResponse;
}

type PayoutResponse = {
  tracking_id: string;
  status: string;
  transactions: { status: string; account: string; amount: string }[];
};

export async function initiatePayout({
  amountKes,
  phoneNumber,
  name,
  narrative,
}: {
  amountKes: number;
  phoneNumber: string;
  name: string;
  narrative: string;
}) {
  const res = await fetch(`${BASE_URL}/api/v1/send-money/initiate/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.INTASEND_SECRET_KEY}`,
    },
    body: JSON.stringify({
      currency: "KES",
      provider: "MPESA-B2C",
      requires_approval: "NO",
      transactions: [
        {
          account: phoneNumber,
          amount: amountKes.toFixed(2),
          name,
          narrative,
        },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`IntaSend payout request failed: ${res.status} ${await res.text()}`);
  }

  return (await res.json()) as PayoutResponse;
}
