import { createServiceClient } from "@/lib/supabase/service";
import { getUserEmail } from "@/lib/email/get-user-email";
import { sendEmail } from "@/lib/email/resend";
import {
  orderPaidEmail,
  orderDeliveredEmail,
  payoutCompletedEmail,
  disputeRaisedEmail,
} from "@/lib/email/templates";

const APP_URL = "https://chub.nyxcollective.africa";
const orderUrl = (orderId: string) => `${APP_URL}/dashboard/orders/${orderId}`;

async function loadOrderContext(orderId: string) {
  const service = createServiceClient();
  const { data: order } = await service
    .from("orders")
    .select(
      "id, amount_kes, brand_id, creative_id, service_packages(title, services(title)), proposals(projects(title))"
    )
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return null;

  const [{ data: brand }, { data: creative }] = await Promise.all([
    service.from("profiles").select("first_name, last_name").eq("id", order.brand_id).maybeSingle(),
    service.from("profiles").select("first_name, last_name").eq("id", order.creative_id).maybeSingle(),
  ]);

  const context = order.service_packages
    ? `${order.service_packages.services?.title} — ${order.service_packages.title}`
    : (order.proposals?.projects?.title ?? "your order");

  return {
    order,
    context,
    brandName: `${brand?.first_name ?? ""} ${brand?.last_name ?? ""}`.trim() || "A brand",
    creativeName: `${creative?.first_name ?? ""} ${creative?.last_name ?? ""}`.trim() || "there",
  };
}

export async function notifyOrderPaid(orderId: string) {
  const ctx = await loadOrderContext(orderId);
  if (!ctx) return;
  const email = await getUserEmail(ctx.order.creative_id);
  if (!email) return;

  const { subject, html } = orderPaidEmail({
    creativeName: ctx.creativeName,
    brandName: ctx.brandName,
    amountKes: ctx.order.amount_kes,
    context: ctx.context,
    orderUrl: orderUrl(orderId),
  });
  await sendEmail({ to: email, subject, html });
}

export async function notifyOrderDelivered(orderId: string) {
  const ctx = await loadOrderContext(orderId);
  if (!ctx) return;
  const email = await getUserEmail(ctx.order.brand_id);
  if (!email) return;

  const { subject, html } = orderDeliveredEmail({
    brandName: ctx.brandName,
    creativeName: ctx.creativeName,
    context: ctx.context,
    orderUrl: orderUrl(orderId),
  });
  await sendEmail({ to: email, subject, html });
}

export async function notifyPayoutCompleted(orderId: string) {
  const ctx = await loadOrderContext(orderId);
  if (!ctx) return;
  const email = await getUserEmail(ctx.order.creative_id);
  if (!email) return;

  const { subject, html } = payoutCompletedEmail({
    creativeName: ctx.creativeName,
    amountKes: ctx.order.amount_kes,
    orderUrl: orderUrl(orderId),
  });
  await sendEmail({ to: email, subject, html });
}

export async function notifyDisputeRaised(orderId: string, raisedByProfileId: string, reason: string) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!adminEmail) return;

  const ctx = await loadOrderContext(orderId);
  if (!ctx) return;

  const { data: raisedBy } = await createServiceClient()
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", raisedByProfileId)
    .maybeSingle();
  const raisedByName = `${raisedBy?.first_name ?? ""} ${raisedBy?.last_name ?? ""}`.trim() || "Someone";

  const { subject, html } = disputeRaisedEmail({
    orderUrl: `${APP_URL}/admin/disputes`,
    amountKes: ctx.order.amount_kes,
    raisedByName,
    reason,
  });
  await sendEmail({ to: adminEmail, subject, html });
}
