"use server";

import { requireProfile } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";
import { signMessageAttachment, fileKind } from "@/lib/storage";
import { verifyMessageAttachment } from "@/lib/message-attachment-verify";
import { containsContactInfo, CONTACT_INFO_BLOCKED_MESSAGE } from "@/lib/contact-filter";

// Returns the inserted row (rather than redirecting/revalidating) so the
// client-side thread can reconcile its optimistic message immediately —
// the realtime subscription also receives this same insert and dedupes by id.
//
// The attachment itself, if any, has already been uploaded directly from the
// browser to Storage by the caller (see conversation-thread.tsx) — routing
// it through this action's own request body would hit Vercel's 4.5MB
// serverless function body limit for anything bigger than a small image.
// This only receives the resulting storage path and re-verifies it
// server-side before trusting it.
export async function sendMessage(conversationId: string, formData: FormData) {
  const profile = await requireProfile();
  const body = String(formData.get("body") ?? "").trim();
  const attachmentPath = String(formData.get("attachment_path") ?? "") || null;
  const declaredMimeType = String(formData.get("attachment_type") ?? "");

  if (!body && !attachmentPath) return null;

  if (body && containsContactInfo(body)) {
    throw new Error(CONTACT_INFO_BLOCKED_MESSAGE);
  }

  const supabase = await createClient();

  const { data: conversation } = await supabase
    .from("conversations")
    .select("id")
    .eq("id", conversationId)
    .or(`user_one_id.eq.${profile.id},user_two_id.eq.${profile.id}`)
    .maybeSingle();
  if (!conversation) throw new Error("You're not part of this conversation.");

  let attachmentType: "image" | "pdf" | null = null;
  if (attachmentPath) {
    if (!attachmentPath.startsWith(`${conversationId}/`)) {
      throw new Error("Could not send message. Try again.");
    }
    const verified = await verifyMessageAttachment(attachmentPath, declaredMimeType);
    if (!verified) throw new Error("That attachment couldn't be verified. Try a different file.");
    attachmentType = fileKind(declaredMimeType);
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
