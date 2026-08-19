"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";
import { getAdvanceEligibility } from "@/lib/finance/advance-eligibility";

export async function requestAdvance(orderId: string, formData: FormData) {
  const profile = await requireProfile();
  if (profile.role !== "creative") return;

  const supabase = await createClient();
  const requestedAmount = Number(formData.get("amount_kes"));
  if (!requestedAmount || requestedAmount <= 0) return;

  const eligibility = await getAdvanceEligibility(supabase, profile.id, orderId);
  if (!eligibility.eligible || requestedAmount > eligibility.maxAmountKes) {
    revalidatePath(`/dashboard/orders/${orderId}`);
    return;
  }

  await supabase.from("advance_requests").insert({
    order_id: orderId,
    creative_id: profile.id,
    requested_amount_kes: requestedAmount,
  });

  revalidatePath(`/dashboard/orders/${orderId}`);
  revalidatePath("/dashboard/advances");
}
