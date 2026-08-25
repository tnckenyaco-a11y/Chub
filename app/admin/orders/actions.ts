"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";

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
  await supabase
    .from("orders")
    .update({ status: "paid" })
    .eq("id", orderId)
    .eq("status", "pending_payment");

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
  revalidatePath("/admin/orders");
}
