import { Resend } from "resend";

const FROM = process.env.EMAIL_FROM ?? "Nyx Creators Hub <creators@nyxcollective.africa>";

// Best-effort: a Resend outage or bad address must never break the
// order/payment mutation this is attached to, so failures are logged and
// swallowed rather than thrown.
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("sendEmail: RESEND_API_KEY not set, skipping send to", to);
    return;
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({ from: FROM, to, subject, html });
    if (error) console.error("sendEmail failed:", error);
  } catch (err) {
    console.error("sendEmail threw:", err);
  }
}
