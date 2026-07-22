"use server";

import { revalidatePath } from "next/cache";
import { forbidden } from "next/navigation";
import { requireProfile } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";

export async function respondToSquadInvite(id: string, status: "accepted" | "declined") {
  const profile = await requireProfile();
  if (profile.role !== "creative") forbidden();

  const supabase = await createClient();
  const { data: invite } = await supabase
    .from("project_squad_invites")
    .update({ status })
    .eq("id", id)
    .eq("creative_id", profile.id)
    .select("project_id")
    .single();

  if (invite) revalidatePath(`/dashboard/proposals`);
}
