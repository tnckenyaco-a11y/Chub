"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import { releasePayoutForOrder } from "@/lib/payments/release-payout";
import type { Database } from "@/lib/supabase/types";

type DisputeStatus = Database["public"]["Enums"]["dispute_status"];

export async function resolveDispute(disputeId: string, formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const resolution = formData.get("resolution") as DisputeStatus;
  const notes = String(formData.get("notes") ?? "").trim();

  const { data: dispute } = await supabase
    .from("disputes")
    .update({
      status: resolution,
      admin_notes: notes || null,
      resolved_by: user.id,
      resolved_at: new Date().toISOString(),
    })
    .eq("id", disputeId)
    .select("order_id")
    .single();

  if (!dispute) return;

  if (resolution === "resolved_released") {
    await supabase.from("orders").update({ status: "completed" }).eq("id", dispute.order_id);
    await releasePayoutForOrder(dispute.order_id);
  } else if (resolution === "resolved_refunded") {
    await supabase.from("orders").update({ status: "refunded" }).eq("id", dispute.order_id);
  }
  // resolved_split: no automatic order status change — the admin_notes above
  // document the manual arrangement between the two parties.

  revalidatePath("/admin/disputes");
}
