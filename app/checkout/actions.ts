"use server";

import { redirect, forbidden } from "next/navigation";
import { requireProfile } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { initiateCollection } from "@/lib/payments/provider";
import { siteOrigin } from "@/lib/site-origin";

async function requireBrand() {
  const profile = await requireProfile();
  if (profile.role !== "brand") forbidden();
  return profile;
}

type CheckoutProfile = { id: string; first_name: string; last_name: string; username: string };

// Shared by a fresh checkout and a retry of an existing order: initiates the
// collection with the provider and redirects, one way or another. Never
// returns normally — every path ends in redirect().
async function initiateOrderPayment({
  order,
  profile,
  userEmail,
  phoneNumber,
  paymentMethod,
}: {
  order: { id: string; amount_kes: number };
  profile: CheckoutProfile;
  userEmail: string | undefined;
  phoneNumber: string;
  paymentMethod: "mpesa" | "card";
}) {
  // The payments table only accepts admin/service-role writes (see the
  // orders_payments_reviews migration). On the IntaSend path that's fine —
  // the webhook below creates the row reactively once IntaSend reports the
  // first state, keyed by the order id it echoes back. Daraja's callback
  // carries no order id of its own, and manual mode has no callback at all,
  // so on both of those paths we pre-create the pending row ourselves right
  // here, via the service client, keyed by whatever provider reference was
  // generated.
  let checkoutUrl: string | undefined;
  try {
    const result = await initiateCollection({
      amountKes: order.amount_kes,
      phoneNumber,
      email: userEmail ?? "no-email@nyxcreatorshub.africa",
      orderId: order.id,
      name: `${profile.first_name} ${profile.last_name}`.trim() || profile.username,
      method: paymentMethod,
      redirectUrl:
        paymentMethod === "card"
          ? `${await siteOrigin()}/dashboard/orders/${order.id}?checkout=1`
          : undefined,
    });

    if (result.provider === "daraja" || result.provider === "manual") {
      await createServiceClient().from("payments").insert({
        order_id: order.id,
        kind: "collection",
        status: "pending",
        amount_kes: order.amount_kes,
        provider_ref: result.providerRef,
      });
    }

    checkoutUrl = result.checkoutUrl;
  } catch (err) {
    redirect(
      `/dashboard/orders/${order.id}?error=${encodeURIComponent(
        err instanceof Error ? err.message : "Could not reach the payment provider."
      )}`
    );
  }

  // Card payments redirect to IntaSend's hosted page to complete payment;
  // everything else (M-Pesa STK push, manual) just waits on the order page.
  redirect(checkoutUrl ?? `/dashboard/orders/${order.id}?checkout=1`);
}

async function startCheckout({
  amountKes,
  orderInsert,
  phoneNumber,
  paymentMethod,
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
  paymentMethod: "mpesa" | "card";
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

  await initiateOrderPayment({
    order: { id: order.id, amount_kes: amountKes },
    profile,
    userEmail: user?.email,
    phoneNumber,
    paymentMethod,
  });
}

// A collection payment that never completed gets auto-failed after 10
// minutes (lib/payments/expire-stale.ts), leaving the order stuck at
// pending_payment with no way forward. This re-initiates payment on the same
// order rather than creating a new one, clearing out the stale failed
// payment row first so retrying doesn't leave duplicates behind.
export async function retryOrderPayment(orderId: string, formData: FormData) {
  const profile = await requireBrand();
  const phoneNumber = String(formData.get("phone_number") ?? "");
  const paymentMethod = formData.get("payment_method") === "card" ? "card" : "mpesa";

  const supabase = await createClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id, amount_kes, status")
    .eq("id", orderId)
    .eq("brand_id", profile.id)
    .maybeSingle();

  if (!order || order.status !== "pending_payment") {
    redirect(`/dashboard/orders/${orderId}?error=${encodeURIComponent("This order can't be retried.")}`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  await createServiceClient()
    .from("payments")
    .delete()
    .eq("order_id", order.id)
    .eq("kind", "collection")
    .eq("status", "failed");

  await initiateOrderPayment({
    order,
    profile,
    userEmail: user?.email,
    phoneNumber,
    paymentMethod,
  });
}

export async function initiateServiceCheckout(packageId: string, formData: FormData) {
  const supabase = await createClient();
  const phoneNumber = String(formData.get("phone_number") ?? "");
  const paymentMethod = formData.get("payment_method") === "card" ? "card" : "mpesa";

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
    paymentMethod,
    redirectBackTo: `/services/${pkg.services.slug}`,
  });
}

export async function initiateProposalCheckout(proposalId: string, formData: FormData) {
  const supabase = await createClient();
  const phoneNumber = String(formData.get("phone_number") ?? "");
  const paymentMethod = formData.get("payment_method") === "card" ? "card" : "mpesa";

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
    paymentMethod,
    redirectBackTo: `/dashboard/projects/${proposal!.project_id}`,
  });
}

export async function initiateSquadCheckout(squadInviteId: string, formData: FormData) {
  const supabase = await createClient();
  const phoneNumber = String(formData.get("phone_number") ?? "");
  const paymentMethod = formData.get("payment_method") === "card" ? "card" : "mpesa";

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
    paymentMethod,
    redirectBackTo: `/dashboard/projects/${invite!.project_id}`,
  });
}
