import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";
import { signMessageAttachment } from "@/lib/storage";
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

  const send = sendMessage.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl uppercase text-ink">
        {other ? `${other.first_name} ${other.last_name}` : "Conversation"}
      </h1>

      <div className="mt-8 space-y-3">
        {messagesWithSignedUrls.map((m) => (
          <div
            key={m.id}
            className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
              m.sender_id === profile.id
                ? "ml-auto bg-volt text-ink"
                : "border border-line text-ink/80"
            }`}
          >
            {m.signedUrl && m.attachment_type === "image" && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={m.signedUrl} alt="Attachment" className="mb-2 max-h-64 rounded-lg" />
            )}
            {m.signedUrl && m.attachment_type === "pdf" && (
              <a
                href={m.signedUrl}
                target="_blank"
                rel="noreferrer"
                className="mb-2 block underline"
              >
                📄 View PDF
              </a>
            )}
            {m.body && <p>{m.body}</p>}
          </div>
        ))}
        {!messagesWithSignedUrls.length && (
          <p className="text-sm text-ink/40">Say hello to start the conversation.</p>
        )}
      </div>

      <form action={send} className="mt-8 space-y-2">
        <div className="flex gap-2">
          <input
            name="body"
            placeholder="Write a message…"
            className="flex-1 rounded-full border border-line bg-transparent px-4 py-2.5 text-sm text-ink outline-none focus:border-volt"
          />
          <button
            type="submit"
            className="rounded-full bg-volt px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-ink"
          >
            Send
          </button>
        </div>
        <label className="flex w-fit cursor-pointer items-center gap-2 text-xs text-ink/50 hover:text-ink">
          📎 Attach image or PDF
          <input
            type="file"
            name="attachment"
            accept="image/png,image/jpeg,image/webp,image/gif,application/pdf"
            className="hidden"
          />
        </label>
      </form>
    </div>
  );
}
