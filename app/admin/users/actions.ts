"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import { createServiceClient } from "@/lib/supabase/service";
import { siteOrigin } from "@/lib/site-origin";
import type { Database } from "@/lib/supabase/types";

type Role = Database["public"]["Enums"]["user_role"];

export async function setSuspended(userId: string, suspended: boolean) {
  const { supabase } = await requireAdmin();
  await supabase.from("profiles").update({ is_suspended: suspended }).eq("id", userId);
  revalidatePath("/admin/users");
}

export async function setRole(userId: string, role: Role) {
  const { supabase } = await requireAdmin();
  await supabase.from("profiles").update({ role }).eq("id", userId);
  revalidatePath("/admin/users");
}

export async function sendPasswordReset(userId: string) {
  const { supabase } = await requireAdmin();
  const service = createServiceClient();

  const { data } = await service.auth.admin.getUserById(userId);
  const email = data.user?.email;
  if (!email) return;

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await siteOrigin()}/auth/callback?next=/reset-password`,
  });
}

// Hard delete: cascades to the user's orders, payments, reviews, disputes,
// messages, conversations, listings, and portfolio (all ON DELETE CASCADE
// from profiles). advance_requests is ON DELETE NO ACTION though, so any
// advance touching this user — as creative, reviewer, or via one of their
// orders — has to be cleared first or the cascade throws a FK violation.
// Done via the service-role client because orders/payments have no RLS
// DELETE policy at all (only profiles does), and RLS still applies to rows
// removed by cascade.
export async function deleteUser(userId: string) {
  const { user } = await requireAdmin();
  if (userId === user.id) return;

  const service = createServiceClient();

  const { data: orders } = await service
    .from("orders")
    .select("id")
    .or(`brand_id.eq.${userId},creative_id.eq.${userId}`);
  const orderIds = (orders ?? []).map((o) => o.id);

  const advanceFilters = [`creative_id.eq.${userId}`, `reviewed_by.eq.${userId}`];
  if (orderIds.length > 0) {
    advanceFilters.push(`order_id.in.(${orderIds.join(",")})`);
  }
  await service.from("advance_requests").delete().or(advanceFilters.join(","));

  await service.from("profiles").delete().eq("id", userId);
  await service.auth.admin.deleteUser(userId);

  revalidatePath("/admin/users");
}
