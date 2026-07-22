"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";

export async function dismissOnboarding() {
  const profile = await requireProfile();
  const supabase = await createClient();
  await supabase.from("profiles").update({ onboarding_dismissed: true }).eq("id", profile.id);
  revalidatePath("/dashboard");
}
