"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";
import { uploadMessageAttachment, fileKind } from "@/lib/storage";

export async function sendMessage(conversationId: string, formData: FormData) {
  const profile = await requireProfile();
  const body = String(formData.get("body") ?? "").trim();
  const file = formData.get("attachment") as File | null;

  if (!body && (!file || file.size === 0)) return;

  const supabase = await createClient();

  let attachmentPath: string | null = null;
  let attachmentType: "image" | "pdf" | null = null;
  if (file && file.size > 0) {
    attachmentPath = await uploadMessageAttachment(supabase, conversationId, file);
    attachmentType = fileKind(file.type);
  }

  await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: profile.id,
    body,
    attachment_url: attachmentPath,
    attachment_type: attachmentType,
  });

  revalidatePath(`/dashboard/messages/${conversationId}`);
  revalidatePath("/dashboard/messages");
}
