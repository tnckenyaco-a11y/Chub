import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";
import { sendMessage } from "@/app/dashboard/messages/actions";

export default async function MessageThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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
      .select("first_name, last_name")
      .eq("id", otherId)
      .maybeSingle(),
    supabase
      .from("messages")
      .select("id, sender_id, body, created_at")
      .eq("conversation_id", id)
      .order("created_at"),
  ]);

  const send = sendMessage.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl uppercase text-paper">
        {other ? `${other.first_name} ${other.last_name}` : "Conversation"}
      </h1>

      <div className="mt-8 space-y-3">
        {messages?.map((m) => (
          <div
            key={m.id}
            className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
              m.sender_id === profile.id
                ? "ml-auto bg-volt text-ink"
                : "border border-line text-paper/80"
            }`}
          >
            {m.body}
          </div>
        ))}
        {!messages?.length && (
          <p className="text-sm text-paper/40">Say hello to start the conversation.</p>
        )}
      </div>

      <form action={send} className="mt-8 flex gap-2">
        <input
          name="body"
          required
          placeholder="Write a message…"
          className="flex-1 rounded-full border border-line bg-transparent px-4 py-2.5 text-sm text-paper outline-none focus:border-volt"
        />
        <button
          type="submit"
          className="rounded-full bg-volt px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-ink"
        >
          Send
        </button>
      </form>
    </div>
  );
}
