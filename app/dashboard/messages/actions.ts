"use server";

import { requireProfile } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";
import { signMessageAttachment, uploadMessageAttachment, fileKind } from "@/lib/storage";
import { containsContactInfo, CONTACT_INFO_BLOCKED_MESSAGE } from "@/lib/contact-filter";

// Returns the inserted row (rather than redirecting/revalidating) so the
// client-side thread can reconcile its optimistic message immediately —
// the realtime subscription also receives this same insert and dedupes by id.
export async function sendMessage(conversationId: string, formData: FormData) {
  const profile = await requireProfile();
  const body = String(formData.get("body") ?? "").trim();
  const file = formData.get("attachment") as File | null;

  if (!body && (!file || file.size === 0)) return null;

  if (body && containsContactInfo(body)) {
    throw new Error(CONTACT_INFO_BLOCKED_MESSAGE);
  }

  const supabase = await createClient();

  let attachmentPath: string | null = null;
  let attachmentType: "image" | "pdf" | null = null;
  if (file && file.size > 0) {
    attachmentPath = await uploadMessageAttachment(supabase, conversationId, file);
    attachmentType = fileKind(file.type);
  }

  const { data: message, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: profile.id,
      body,
      attachment_url: attachmentPath,
      attachment_type: attachmentType,
    })
    .select("id, sender_id, body, attachment_url, attachment_type, created_at")
    .single();

  if (error || !message) throw new Error("Could not send message. Try again.");

  return {
    ...message,
    signedUrl: message.attachment_url ? await signMessageAttachment(supabase, message.attachment_url) : null,
  };
}
