"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";

export async function sendMessage(conversationId: string, formData: FormData) {
  const profile = await requireProfile();
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  const supabase = await createClient();
  await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, sender_id: profile.id, body });

  revalidatePath(`/dashboard/messages/${conversationId}`);
  revalidatePath("/dashboard/messages");
}
