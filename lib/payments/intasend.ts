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

// IntaSend phone numbers are expected as 2547XXXXXXXX / 2541XXXXXXXX (no leading +).
export function normalizeKenyanPhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0")) return `254${digits.slice(1)}`;
  if (digits.startsWith("7") || digits.startsWith("1")) return `254${digits}`;
  return digits;
}
