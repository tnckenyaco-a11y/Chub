"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import { createServiceClient } from "@/lib/supabase/service";
import { notifyOrderPaid, notifyPayoutCompleted } from "@/lib/email/notify";
import type { Database } from "@/lib/supabase/types";

type OrderStatus = Database["public"]["Enums"]["order_status"];
type PaymentStatus = Database["public"]["Enums"]["payment_status"];

// Manual-mode confirmations: mirrors what the IntaSend webhook does
// automatically (see app/api/payments/intasend/webhook/route.ts), just
// triggered by an admin click instead of a provider callback, for orders
// running with PAYMENT_PROVIDER=manual (collected/disbursed by hand over
// personal M-Pesa during the trial period).

export async function confirmManualPayment(orderId: string) {
  const { supabase } = await requireAdmin();

  const { data: payment } = await supabase
    .from("payments")
    .select("id")
    .eq("order_id", orderId)
    .eq("kind", "collection")
    .eq("status", "pending")
    .maybeSingle();

  if (!payment) {
    revalidatePath("/admin/orders");
    return;
  }

  await supabase.from("payments").update({ status: "successful" }).eq("id", payment.id);
  const { data: updated } = await supabase
    .from("orders")
    .update({ status: "paid" })
    .eq("id", orderId)
    .eq("status", "pending_payment")
    .select("id")
    .maybeSingle();

  if (updated) await notifyOrderPaid(orderId);
  revalidatePath("/admin/orders");
}

export async function confirmManualPayout(orderId: string) {
  const { supabase } = await requireAdmin();

  const { data: payment } = await supabase
    .from("payments")
    .select("id")
    .eq("order_id", orderId)
    .eq("kind", "payout")
    .eq("status", "pending")
    .maybeSingle();

  if (!payment) {
    revalidatePath("/admin/orders");
    return;
  }

  await supabase.from("payments").update({ status: "successful" }).eq("id", payment.id);
  await notifyPayoutCompleted(orderId);
  revalidatePath("/admin/orders");
}

export async function setOrderStatus(orderId: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const status = formData.get("status") as OrderStatus;

  await supabase.from("orders").update({ status }).eq("id", orderId);
  revalidatePath("/admin/orders");
}

export async function setPaymentStatus(paymentId: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const status = formData.get("status") as PaymentStatus;

  const { data: payment } = await supabase
    .from("payments")
    .update({ status })
    .eq("id", paymentId)
    .select("order_id, kind")
    .single();

  if (payment && status === "successful") {
    if (payment.kind === "collection") {
      // Mirror confirmManualPayment: a collection payment turning
      // successful should carry the order from pending_payment to paid,
      // same as the IntaSend webhook does automatically.
      const { data: updated } = await supabase
        .from("orders")
        .update({ status: "paid" })
        .eq("id", payment.order_id)
        .eq("status", "pending_payment")
        .select("id")
        .maybeSingle();
      if (updated) await notifyOrderPaid(payment.order_id);
    } else {
      await notifyPayoutCompleted(payment.order_id);
    }
  }

  revalidatePath("/admin/orders");
}

// Deleting an order cascades to its payments/reviews/disputes (all ON
// DELETE CASCADE), but advance_requests.order_id is ON DELETE NO ACTION —
// a hard FK block, not an RLS issue — so any advance tied to this order has
// to go first. Uses the service-role client because orders/payments have no
// RLS DELETE policy at all, and RLS still applies to rows removed by
// cascade.
export async function deleteOrder(orderId: string) {
  await requireAdmin();
  const service = createServiceClient();

  await service.from("advance_requests").delete().eq("order_id", orderId);
  await service.from("orders").delete().eq("id", orderId);

  revalidatePath("/admin/orders");
}

export async function deletePayment(paymentId: string) {
  await requireAdmin();
  await createServiceClient().from("payments").delete().eq("id", paymentId);
  revalidatePath("/admin/orders");
}
