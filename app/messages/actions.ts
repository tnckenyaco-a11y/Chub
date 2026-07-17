"use server";

import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";

export async function startConversation(otherUserId: string) {
  const profile = await requireProfile();
  if (otherUserId === profile.id) redirect("/dashboard/messages");

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .or(
      `and(user_one_id.eq.${profile.id},user_two_id.eq.${otherUserId}),and(user_one_id.eq.${otherUserId},user_two_id.eq.${profile.id})`
    )
    .maybeSingle();

  if (existing) redirect(`/dashboard/messages/${existing.id}`);

  const { data: conversation, error } = await supabase
    .from("conversations")
    .insert({ user_one_id: profile.id, user_two_id: otherUserId })
    .select("id")
    .single();

  if (error || !conversation) redirect("/dashboard/messages");

  redirect(`/dashboard/messages/${conversation.id}`);
}
