import { timingSafeEqual } from "crypto";

function safeEqual(a: string | null, b: string | undefined): boolean {
  if (!a || !b) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

// Safaricom calls these callback URLs with no authentication of its own — the
// only gate is a shared secret embedded in the callback URL itself when we
// initiate each STK push/B2C request (see lib/payments/daraja.ts's
// callbackUrl()). Without this, anyone who observes or guesses a
// CheckoutRequestID/ConversationID could POST a fake success event.
export function verifyDarajaCallback(request: Request): boolean {
  const url = new URL(request.url);
  return safeEqual(url.searchParams.get("secret"), process.env.DARAJA_CALLBACK_SECRET);
}
