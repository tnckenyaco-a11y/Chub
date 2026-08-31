const BASE_URL = "https://chub.nyxcollective.africa";
const BRAND_PURPLE = "#851490";
const INK = "#1b120b";

function wrapEmail(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background-color:#f6f3f4;font-family:Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f6f3f4;padding:32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="background-color:${BRAND_PURPLE};padding:24px 32px;">
                <img src="${BASE_URL}/logo-lockup-white.png" alt="Nyx Creators Hub" height="26" style="display:block;" />
              </td>
            </tr>
            <tr>
              <td style="padding:32px;color:${INK};font-size:15px;line-height:1.6;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px;border-top:1px solid #eee;color:#999;font-size:12px;">
                Nyx Creators Hub &mdash; The trusted marketplace connecting Africa's creative talent with brands who need them.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function button(label: string, url: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:24px;">
    <tr>
      <td style="background-color:${BRAND_PURPLE};border-radius:999px;">
        <a href="${url}" style="display:inline-block;padding:12px 28px;color:#ffffff;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;text-decoration:none;">${label}</a>
      </td>
    </tr>
  </table>`;
}

const fmtKes = (amountKes: number) => `Ksh ${amountKes.toLocaleString()}`;

export function orderPaidEmail({
  creativeName,
  brandName,
  amountKes,
  context,
  orderUrl,
}: {
  creativeName: string;
  brandName: string;
  amountKes: number;
  context: string;
  orderUrl: string;
}) {
  return {
    subject: `New paid order: ${context}`,
    html: wrapEmail(`
      <p>Hi ${creativeName},</p>
      <p><strong>${brandName}</strong> just paid for <strong>${context}</strong> &mdash; ${fmtKes(amountKes)}.</p>
      <p>Time to get started. Open the order and mark it in progress when you begin work.</p>
      ${button("View Order", orderUrl)}
    `),
  };
}

export function orderDeliveredEmail({
  brandName,
  creativeName,
  context,
  orderUrl,
}: {
  brandName: string;
  creativeName: string;
  context: string;
  orderUrl: string;
}) {
  return {
    subject: `${creativeName} delivered your order`,
    html: wrapEmail(`
      <p>Hi ${brandName},</p>
      <p><strong>${creativeName}</strong> has delivered <strong>${context}</strong>. Please review the work and approve it to release payment.</p>
      ${button("Review Order", orderUrl)}
    `),
  };
}

export function payoutCompletedEmail({
  creativeName,
  amountKes,
  orderUrl,
}: {
  creativeName: string;
  amountKes: number;
  orderUrl: string;
}) {
  return {
    subject: `Your payout of ${fmtKes(amountKes)} is on its way`,
    html: wrapEmail(`
      <p>Hi ${creativeName},</p>
      <p>Your payout of <strong>${fmtKes(amountKes)}</strong> has been sent. It should reflect in your M-Pesa shortly.</p>
      ${button("View Order", orderUrl)}
    `),
  };
}

export function disputeRaisedEmail({
  orderUrl,
  amountKes,
  raisedByName,
  reason,
}: {
  orderUrl: string;
  amountKes: number;
  raisedByName: string;
  reason: string;
}) {
  return {
    subject: `Dispute raised — ${fmtKes(amountKes)} order`,
    html: wrapEmail(`
      <p><strong>${raisedByName}</strong> raised a dispute on an order (${fmtKes(amountKes)}).</p>
      <p style="background-color:#f6f3f4;border-radius:8px;padding:12px 16px;">${reason}</p>
      ${button("Review Dispute", orderUrl)}
    `),
  };
}
