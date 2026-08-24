import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";
import { signMessageAttachment } from "@/lib/storage";
import { ConversationThread } from "@/components/messages/conversation-thread";

export default async function MessageThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await requireProfile();
  const { id } = await params;
  const supabase = await createClient();

  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, user_one_id, user_two_id")
    .eq("id", id)
    .maybeSingle();

  if (
    !conversation ||
    (conversation.user_one_id !== profile.id && conversation.user_two_id !== profile.id)
  ) {
    notFound();
  }

  const otherId =
    conversation.user_one_id === profile.id ? conversation.user_two_id : conversation.user_one_id;

  const [{ data: other }, { data: messages }] = await Promise.all([
    supabase
      .from("public_profiles")
      .select("first_name, last_name, username, avatar_url")
      .eq("id", otherId)
      .maybeSingle(),
    supabase
      .from("messages")
      .select("id, sender_id, body, attachment_url, attachment_type, created_at")
      .eq("conversation_id", id)
      .order("created_at"),
  ]);

  const messagesWithSignedUrls = await Promise.all(
    (messages ?? []).map(async (m) => ({
      ...m,
      signedUrl: m.attachment_url ? await signMessageAttachment(supabase, m.attachment_url) : null,
    }))
  );

  const otherName = other
    ? `${other.first_name} ${other.last_name}`.trim() || other.username || "Unknown user"
    : "Unknown user";

  return (
    <ConversationThread
      conversationId={id}
      currentUserId={profile.id}
      otherUser={{ name: otherName, avatarUrl: other?.avatar_url ?? null }}
      initialMessages={messagesWithSignedUrls}
    />
  );
}
