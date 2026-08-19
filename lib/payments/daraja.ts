import crypto from "node:crypto";
import { normalizeKenyanPhone } from "@/lib/payments/phone";

const BASE_URL =
  process.env.DARAJA_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

function callbackUrl(path: string) {
  const base = process.env.DARAJA_CALLBACK_BASE_URL?.replace(/\/$/, "") ?? "";
  return `${base}${path}`;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  const auth = Buffer.from(
    `${process.env.DARAJA_CONSUMER_KEY}:${process.env.DARAJA_CONSUMER_SECRET}`
  ).toString("base64");

  const res = await fetch(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
  });

  if (!res.ok) {
    throw new Error(`Daraja OAuth token request failed: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: string };
  cachedToken = {
    token: data.access_token,
    // Refresh a little early rather than risk a request landing right at expiry.
    expiresAt: Date.now() + (Number(data.expires_in) - 60) * 1000,
  };
  return cachedToken.token;
}

function darajaTimestamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    String(d.getFullYear()) +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds())
  );
}

type StkPushResponse = {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
};

export async function initiateStkPush({
  amountKes,
  phoneNumber,
  accountReference,
  transactionDesc,
}: {
  amountKes: number;
  phoneNumber: string;
  accountReference: string;
  transactionDesc: string;
}): Promise<StkPushResponse> {
  const shortcode = process.env.DARAJA_SHORTCODE!;
  const timestamp = darajaTimestamp();
  const password = Buffer.from(`${shortcode}${process.env.DARAJA_PASSKEY}${timestamp}`).toString(
    "base64"
  );
  const token = await getAccessToken();
  const phone = normalizeKenyanPhone(phoneNumber);

  const res = await fetch(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(amountKes),
      PartyA: phone,
      PartyB: shortcode,
      PhoneNumber: phone,
      CallBackURL: callbackUrl("/api/payments/daraja/stk-callback"),
      AccountReference: accountReference,
      TransactionDesc: transactionDesc,
    }),
  });

  if (!res.ok) {
    throw new Error(`Daraja STK push failed: ${res.status} ${await res.text()}`);
  }

  return (await res.json()) as StkPushResponse;
}

// Safaricom's backend decrypts SecurityCredential with the older PKCS1v1.5
// scheme (Java's RSA/ECB/PKCS1Padding) — deliberately NOT the generally
// recommended OAEP padding, which would silently produce a credential Daraja
// can't decrypt.
function buildSecurityCredential(): string {
  return crypto
    .publicEncrypt(
      {
        key: process.env.DARAJA_B2C_CERT!,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      Buffer.from(process.env.DARAJA_INITIATOR_PASSWORD!)
    )
    .toString("base64");
}

type B2CResponse = {
  ConversationID: string;
  OriginatorConversationID: string;
  ResponseCode: string;
  ResponseDescription: string;
};

export async function initiateB2C({
  amountKes,
  phoneNumber,
  remarks,
}: {
  amountKes: number;
  phoneNumber: string;
  remarks: string;
}): Promise<B2CResponse> {
  const token = await getAccessToken();
  const phone = normalizeKenyanPhone(phoneNumber);

  const res = await fetch(`${BASE_URL}/mpesa/b2c/v1/paymentrequest`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      InitiatorName: process.env.DARAJA_INITIATOR_NAME,
      SecurityCredential: buildSecurityCredential(),
      CommandID: "BusinessPayment",
      Amount: Math.round(amountKes),
      PartyA: process.env.DARAJA_SHORTCODE,
      PartyB: phone,
      Remarks: remarks,
      QueueTimeOutURL: callbackUrl("/api/payments/daraja/b2c-timeout"),
      ResultURL: callbackUrl("/api/payments/daraja/b2c-result"),
      Occasion: "Nyx Creators Hub payout",
    }),
  });

  if (!res.ok) {
    throw new Error(`Daraja B2C request failed: ${res.status} ${await res.text()}`);
  }

  return (await res.json()) as B2CResponse;
}
