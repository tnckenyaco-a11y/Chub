"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import type { Database } from "@/lib/supabase/types";

type AdvanceStatus = Database["public"]["Enums"]["advance_status"];
type AdvanceReasonCode = Database["public"]["Enums"]["advance_reason_code"];

export async function reviewAdvance(advanceId: string, formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const decision = formData.get("decision") as AdvanceStatus;
  const reasonCode = (formData.get("reason_code") as AdvanceReasonCode) || null;
  const reasonNote = String(formData.get("reason_note") ?? "").trim();

  if (!["approved", "partial", "declined"].includes(decision)) return;

  const { data: advance } = await supabase
    .from("advance_requests")
    .select("requested_amount_kes")
    .eq("id", advanceId)
    .maybeSingle();

  if (!advance) return;

  let approvedAmount: number | null = null;
  if (decision === "approved") {
    approvedAmount = advance.requested_amount_kes;
  } else if (decision === "partial") {
    approvedAmount = Number(formData.get("approved_amount_kes"));
    if (!approvedAmount || approvedAmount <= 0 || approvedAmount >= advance.requested_amount_kes) {
      return;
    }
  }

  await supabase
    .from("advance_requests")
    .update({
      status: decision,
      approved_amount_kes: approvedAmount,
      reason_code: decision === "approved" ? null : reasonCode,
      reason_note: reasonNote || null,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", advanceId);

  revalidatePath("/admin/advances");
}

export async function confirmDisbursed(advanceId: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const reference = String(formData.get("disbursed_reference") ?? "").trim();
  if (!reference) return;

  await supabase
    .from("advance_requests")
    .update({
      status: "disbursed",
      disbursed_reference: reference,
      disbursed_at: new Date().toISOString(),
    })
    .eq("id", advanceId)
    .in("status", ["approved", "partial"]);

  revalidatePath("/admin/advances");
}
