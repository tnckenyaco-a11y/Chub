"use server";

import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";

// `formData` is optional because most callers bind this with no extra
// fields (a plain "Send Message" button) — Next.js still appends the
// (empty) FormData from the <form> submission automatically. Callers that
// want a prefilled first message (e.g. "Message about this" on a portfolio
// piece) include an "about" field, carried through as a query param since
// there's no message to attach it to until the conversation exists.
export async function startConversation(otherUserId: string, formData?: FormData) {
  const profile = await requireProfile();
  if (otherUserId === profile.id) redirect("/dashboard/messages");

  const about = String(formData?.get("about") ?? "").trim();
  const suffix = about ? `?about=${encodeURIComponent(about)}` : "";

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .or(
      `and(user_one_id.eq.${profile.id},user_two_id.eq.${otherUserId}),and(user_one_id.eq.${otherUserId},user_two_id.eq.${profile.id})`
    )
    .maybeSingle();

  if (existing) redirect(`/dashboard/messages/${existing.id}${suffix}`);

  const { data: conversation, error } = await supabase
    .from("conversations")
    .insert({ user_one_id: profile.id, user_two_id: otherUserId })
    .select("id")
    .single();

  if (error || !conversation) redirect("/dashboard/messages");

  redirect(`/dashboard/messages/${conversation.id}${suffix}`);
}
