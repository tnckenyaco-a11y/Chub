"use server";

import { redirect, forbidden } from "next/navigation";
import { requireProfile } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";
import { initiateSTKPush, normalizeKenyanPhone } from "@/lib/payments/intasend";

async function requireBrand() {
  const profile = await requireProfile();
  if (profile.role !== "brand") forbidden();
  return profile;
}

async function startCheckout({
  amountKes,
  orderInsert,
  phoneNumber,
  redirectBackTo,
}: {
  amountKes: number;
  orderInsert: {
    package_id?: string;
    proposal_id?: string;
    squad_invite_id?: string;
    creative_id: string;
  };
  phoneNumber: string;
  redirectBackTo: string;
}) {
  const profile = await requireBrand();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      brand_id: profile.id,
      creative_id: orderInsert.creative_id,
      package_id: orderInsert.package_id ?? null,
      proposal_id: orderInsert.proposal_id ?? null,
      squad_invite_id: orderInsert.squad_invite_id ?? null,
      amount_kes: amountKes,
    })
    .select("id")
    .single();

  if (error || !order) {
    redirect(`${redirectBackTo}?error=${encodeURIComponent(error?.message ?? "Could not start checkout.")}`);
  }

  // The payments table only accepts admin/service-role writes (see the
  // orders_payments_reviews migration), so the payment row itself is
  // created by the webhook below once IntaSend reports the first state —
  // not here under the brand's own session.
  try {
    const normalizedPhone = normalizeKenyanPhone(phoneNumber);
    await initiateSTKPush({
      amountKes,
      phoneNumber: normalizedPhone,
      email: user?.email ?? "no-email@nyxcreatorshub.africa",
      apiRef: order.id,
      name: `${profile.first_name} ${profile.last_name}`.trim() || profile.username,
    });
  } catch (err) {
    redirect(
      `/dashboard/orders/${order.id}?error=${encodeURIComponent(
        err instanceof Error ? err.message : "Could not reach the payment provider."
      )}`
    );
  }

  redirect(`/dashboard/orders/${order.id}?checkout=1`);
}

export async function initiateServiceCheckout(packageId: string, formData: FormData) {
  const supabase = await createClient();
  const phoneNumber = String(formData.get("phone_number") ?? "");

  const { data: pkg } = await supabase
    .from("service_packages")
    .select("price_kes, services(creative_id, slug)")
    .eq("id", packageId)
    .maybeSingle();

  if (!pkg?.services) redirect("/services?error=Package+not+found.");

  await startCheckout({
    amountKes: pkg.price_kes,
    orderInsert: { package_id: packageId, creative_id: pkg.services.creative_id },
    phoneNumber,
    redirectBackTo: `/services/${pkg.services.slug}`,
  });
}

export async function initiateProposalCheckout(proposalId: string, formData: FormData) {
  const supabase = await createClient();
  const phoneNumber = String(formData.get("phone_number") ?? "");

  const { data: proposal } = await supabase
    .from("proposals")
    .select("rate, creative_id, project_id, status")
    .eq("id", proposalId)
    .maybeSingle();

  if (!proposal || proposal.status !== "accepted") {
    redirect("/dashboard/projects?error=Proposal+not+ready+for+checkout.");
  }

  await startCheckout({
    amountKes: proposal!.rate,
    orderInsert: { proposal_id: proposalId, creative_id: proposal!.creative_id },
    phoneNumber,
    redirectBackTo: `/dashboard/projects/${proposal!.project_id}`,
  });
}

export async function initiateSquadCheckout(squadInviteId: string, formData: FormData) {
  const supabase = await createClient();
  const phoneNumber = String(formData.get("phone_number") ?? "");

  const { data: invite } = await supabase
    .from("project_squad_invites")
    .select("rate_kes, creative_id, project_id, status")
    .eq("id", squadInviteId)
    .maybeSingle();

  if (!invite || invite.status !== "accepted") {
    redirect("/dashboard/projects?error=Squad+member+not+ready+for+checkout.");
  }

  await startCheckout({
    amountKes: invite!.rate_kes,
    orderInsert: { squad_invite_id: squadInviteId, creative_id: invite!.creative_id },
    phoneNumber,
    redirectBackTo: `/dashboard/projects/${invite!.project_id}`,
  });
}
