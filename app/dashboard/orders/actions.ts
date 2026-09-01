"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";
import { releasePayoutForOrder } from "@/lib/payments/release-payout";
import { notifyOrderDelivered, notifyDisputeRaised } from "@/lib/email/notify";
import { containsContactInfo, CONTACT_INFO_BLOCKED_MESSAGE } from "@/lib/contact-filter";

export async function markInProgress(orderId: string) {
  const profile = await requireProfile();
  const supabase = await createClient();
  await supabase
    .from("orders")
    .update({ status: "in_progress" })
    .eq("id", orderId)
    .eq("creative_id", profile.id);
  revalidatePath(`/dashboard/orders/${orderId}`);
}

export async function markDelivered(orderId: string) {
  const profile = await requireProfile();
  const supabase = await createClient();
  const { data: updated } = await supabase
    .from("orders")
    .update({ status: "delivered" })
    .eq("id", orderId)
    .eq("creative_id", profile.id)
    .select("id")
    .maybeSingle();
  if (updated) await notifyOrderDelivered(orderId);
  revalidatePath(`/dashboard/orders/${orderId}`);
}

export async function approveAndRelease(orderId: string) {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .eq("brand_id", profile.id)
    .maybeSingle();

  if (!existing || existing.status !== "delivered") {
    revalidatePath(`/dashboard/orders/${orderId}`);
    return;
  }

  const { data: order, error } = await supabase
    .from("orders")
    .update({ status: "completed" })
    .eq("id", orderId)
    .eq("brand_id", profile.id)
    .select("id")
    .single();

  if (error || !order) {
    revalidatePath(`/dashboard/orders/${orderId}`);
    return;
  }

  await releasePayoutForOrder(orderId);
  revalidatePath(`/dashboard/orders/${orderId}`);
}

export async function raiseDispute(orderId: string, formData: FormData) {
  const profile = await requireProfile();
  const supabase = await createClient();
  const reason = String(formData.get("reason") ?? "").trim();
  if (!reason) return;

  // Both parties see the dispute reason on the shared order page — must
  // never become a channel for exchanging off-platform contact info.
  if (containsContactInfo(reason)) {
    redirect(`/dashboard/orders/${orderId}?error=${encodeURIComponent(CONTACT_INFO_BLOCKED_MESSAGE)}`);
  }

  const { data: order } = await supabase
    .from("orders")
    .update({ status: "disputed" })
    .eq("id", orderId)
    .or(`brand_id.eq.${profile.id},creative_id.eq.${profile.id}`)
    .select("id")
    .maybeSingle();

  if (!order) {
    revalidatePath(`/dashboard/orders/${orderId}`);
    return;
  }

  await supabase.from("disputes").insert({ order_id: orderId, raised_by: profile.id, reason });
  await notifyDisputeRaised(orderId, profile.id, reason);
  revalidatePath(`/dashboard/orders/${orderId}`);
  redirect(`/dashboard/orders/${orderId}`);
}

export async function submitReview(orderId: string, formData: FormData) {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("brand_id, creative_id, status")
    .eq("id", orderId)
    .maybeSingle();

  if (!order || order.status !== "completed") return;
  const revieweeId = order.brand_id === profile.id ? order.creative_id : order.brand_id;

  const rating = (name: string) => {
    const v = Number(formData.get(name));
    return v >= 1 && v <= 5 ? v : null;
  };

  const comment = String(formData.get("comment") ?? "").trim();

  // Reviews are shown publicly on the creative's profile — must never become
  // a channel for exchanging off-platform contact info.
  if (comment && containsContactInfo(comment)) {
    redirect(`/dashboard/orders/${orderId}?error=${encodeURIComponent(CONTACT_INFO_BLOCKED_MESSAGE)}`);
  }

  await supabase.from("reviews").insert({
    order_id: orderId,
    reviewer_id: profile.id,
    reviewee_id: revieweeId,
    overall_rating: rating("overall_rating") ?? 5,
    quality_rating: rating("quality_rating"),
    communication_rating: rating("communication_rating"),
    timeliness_rating: rating("timeliness_rating"),
    value_rating: rating("value_rating"),
    comment,
  });

  revalidatePath(`/dashboard/orders/${orderId}`);
}
