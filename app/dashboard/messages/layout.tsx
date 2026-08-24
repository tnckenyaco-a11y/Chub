import { requireProfile } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";
import { MessagesShell, type ConversationSummary } from "@/components/messages/messages-shell";

export default async function MessagesLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: conversations } = await supabase
    .from("conversations")
    .select("id, user_one_id, user_two_id, last_message_at")
    .or(`user_one_id.eq.${profile.id},user_two_id.eq.${profile.id}`)
    .order("last_message_at", { ascending: false });

  const otherIds = (conversations ?? []).map((c) =>
    c.user_one_id === profile.id ? c.user_two_id : c.user_one_id
  );
  const conversationIds = (conversations ?? []).map((c) => c.id);

  const { data: others } = otherIds.length
    ? await supabase
        .from("public_profiles")
        .select("id, first_name, last_name, username, avatar_url")
        .in("id", otherIds)
    : { data: [] };

  const { data: lastMessages } = conversationIds.length
    ? await supabase
        .from("messages")
        .select("conversation_id, sender_id, body, attachment_type, created_at")
        .in("conversation_id", conversationIds)
        .order("created_at", { ascending: false })
    : { data: [] };

  const othersById = new Map((others ?? []).map((o) => [o.id, o]));
  const lastMessageByConversation = new Map<string, NonNullable<typeof lastMessages>[number]>();
  for (const m of lastMessages ?? []) {
    if (!lastMessageByConversation.has(m.conversation_id)) {
      lastMessageByConversation.set(m.conversation_id, m);
    }
  }

  const summaries: ConversationSummary[] = (conversations ?? []).map((c) => {
    const otherId = c.user_one_id === profile.id ? c.user_two_id : c.user_one_id;
    const other = othersById.get(otherId);
    const last = lastMessageByConversation.get(c.id);
    return {
      id: c.id,
      lastMessageAt: c.last_message_at,
      other: other
        ? {
            id: other.id ?? otherId,
            name: `${other.first_name} ${other.last_name}`.trim() || other.username || "Unknown user",
            avatarUrl: other.avatar_url,
          }
        : { id: otherId, name: "Unknown user", avatarUrl: null },
      preview: last
        ? {
            body: last.body,
            attachmentType: last.attachment_type,
            isOwn: last.sender_id === profile.id,
          }
        : null,
    };
  });

  return (
    <MessagesShell conversations={summaries} currentUserId={profile.id}>
      {children}
    </MessagesShell>
  );
}
