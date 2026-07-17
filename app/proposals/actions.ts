"use server";

import { revalidatePath } from "next/cache";
import { redirect, forbidden } from "next/navigation";
import { requireProfile } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";

export async function submitProposal(projectSlug: string, formData: FormData) {
  const profile = await requireProfile();
  if (profile.role !== "creative") forbidden();

  const supabase = await createClient();
  const projectId = String(formData.get("project_id") ?? "");
  const message = String(formData.get("message") ?? "").trim();
  const rate = Number(formData.get("rate"));

  if (!projectId || !rate) {
    redirect(`/projects/${projectSlug}?error=Please+include a rate.`);
  }

  const { error } = await supabase
    .from("proposals")
    .insert({ project_id: projectId, creative_id: profile.id, message, rate });

  if (error) {
    redirect(`/projects/${projectSlug}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/projects/${projectSlug}`);
  revalidatePath("/dashboard/proposals");
  redirect(`/projects/${projectSlug}?sent=1`);
}

export async function withdrawProposal(id: string) {
  const profile = await requireProfile();
  if (profile.role !== "creative") forbidden();

  const supabase = await createClient();
  await supabase
    .from("proposals")
    .update({ status: "withdrawn" })
    .eq("id", id)
    .eq("creative_id", profile.id);

  revalidatePath("/dashboard/proposals");
}
