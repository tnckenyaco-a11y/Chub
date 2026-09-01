"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, FileText, Paperclip, Send, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { signMessageAttachment, uploadMessageAttachment } from "@/lib/storage";
import { sendMessage } from "@/app/dashboard/messages/actions";
import { formatBubbleTime, formatDayDivider } from "@/components/messages/format-timestamp";
import { ClientTime } from "@/components/messages/client-time";

export type ThreadMessage = {
  id: string;
  sender_id: string;
  body: string;
  attachment_url: string | null;
  attachment_type: string | null;
  created_at: string;
  signedUrl: string | null;
  pending?: boolean;
};

function sortByCreatedAt(list: ThreadMessage[]) {
  return [...list].sort((a, b) => a.created_at.localeCompare(b.created_at));
}

// UTC-based on purpose: this only decides whether to render a divider
// between two known message timestamps, so it must be deterministic between
// server and client regardless of either's local timezone. The divider's
// displayed label is separately rendered in the viewer's local time via
// ClientTime, after mount.
function sameDay(a: string, b: string) {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getUTCFullYear() === db.getUTCFullYear() &&
    da.getUTCMonth() === db.getUTCMonth() &&
    da.getUTCDate() === db.getUTCDate()
  );
}

export function ConversationThread({
  conversationId,
  currentUserId,
  otherUser,
  initialMessages,
}: {
  conversationId: string;
  currentUserId: string;
  otherUser: { name: string; avatarUrl: string | null };
  initialMessages: ThreadMessage[];
}) {
  const [messages, setMessages] = useState(() => sortByCreatedAt(initialMessages));
  const [error, setError] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    // The realtime client attaches the session's JWT asynchronously as part
    // of auth initialization; subscribing before that resolves joins the
    // channel as anonymous, and RLS then silently filters out every event.
    // Awaiting getSession() first guarantees the token is attached in time.
    supabase.auth.getSession().then(() => {
      if (cancelled) return;
      channel = supabase
        .channel(`thread:${conversationId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
          async (payload) => {
            const m = payload.new as Omit<ThreadMessage, "signedUrl">;
            const signedUrl = m.attachment_url ? await signMessageAttachment(supabase, m.attachment_url) : null;
            setMessages((prev) => {
              if (prev.some((existing) => existing.id === m.id)) return prev;
              return sortByCreatedAt([...prev, { ...m, signedUrl }]);
            });
          }
        )
        .subscribe();
    });

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [conversationId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const body = String(formData.get("body") ?? "").trim();
    const file = pendingFile;

    if (!body && !file) return;

    const tempId = `temp-${crypto.randomUUID()}`;
    const optimistic: ThreadMessage = {
      id: tempId,
      sender_id: currentUserId,
      body,
      attachment_url: null,
      attachment_type: file ? (file.type === "application/pdf" ? "pdf" : "image") : null,
      created_at: new Date().toISOString(),
      signedUrl: file && file.type !== "application/pdf" ? URL.createObjectURL(file) : null,
      pending: true,
    };

    setMessages((prev) => sortByCreatedAt([...prev, optimistic]));
    form.reset();
    setPendingFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setSending(true);

    try {
      const payload = new FormData();
      payload.set("body", body);

      if (file) {
        // Uploaded directly from the browser to Storage rather than through
        // the server action's own request body — a real photo or PDF
        // routinely exceeds Vercel's hard 4.5MB serverless function body
        // limit, which previously made attaching anything but a small image
        // fail with an opaque error.
        const supabase = createClient();
        const path = await uploadMessageAttachment(supabase, conversationId, file);
        payload.set("attachment_path", path);
        payload.set("attachment_type", file.type);
      }

      const result = await sendMessage(conversationId, payload);
      setMessages((prev) => {
        const withoutTemp = prev.filter((m) => m.id !== tempId);
        if (!result || withoutTemp.some((m) => m.id === result.id)) return withoutTemp;
        return sortByCreatedAt([...withoutTemp, result]);
      });
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setError(err instanceof Error ? err.message : "Could not send message. Try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-line px-4 py-3">
        <Link href="/dashboard/messages" className="text-ink/50 hover:text-ink md:hidden">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <span
          className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-grad-brand bg-cover bg-center text-xs font-bold text-paper"
          style={otherUser.avatarUrl ? { backgroundImage: `url(${otherUser.avatarUrl})` } : undefined}
        >
          {!otherUser.avatarUrl && (
            <span className="flex h-full w-full items-center justify-center">
              {otherUser.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </span>
          )}
        </span>
        <p className="font-medium text-ink">{otherUser.name}</p>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
        {messages.map((m, i) => {
          const prev = messages[i - 1];
          const showDivider = !prev || !sameDay(prev.created_at, m.created_at);
          const isOwn = m.sender_id === currentUserId;
          const grouped = !showDivider && prev && prev.sender_id === m.sender_id;

          return (
            <div key={m.id}>
              {showDivider && (
                <div className="my-4 flex justify-center">
                  <span className="rounded-full bg-bg px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-ink/40">
                    <ClientTime iso={m.created_at} format={formatDayDivider} />
                  </span>
                </div>
              )}
              <div
                className={`flex ${isOwn ? "justify-end" : "justify-start"} ${grouped ? "mt-0.5" : "mt-3"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                    isOwn ? "bg-grad-brand text-paper" : "border border-line bg-paper text-ink/80"
                  } ${m.pending ? "opacity-60" : ""}`}
                >
                  {m.attachment_type === "image" && m.signedUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.signedUrl} alt="Attachment" className="mb-1.5 max-h-64 rounded-lg" />
                  )}
                  {m.attachment_type === "pdf" && (
                    <a
                      href={m.signedUrl ?? undefined}
                      target="_blank"
                      rel="noreferrer"
                      className={`mb-1.5 flex items-center gap-1.5 underline ${!m.signedUrl ? "pointer-events-none opacity-60" : ""}`}
                    >
                      <FileText className="h-3.5 w-3.5" /> {m.signedUrl ? "View PDF" : "Uploading…"}
                    </a>
                  )}
                  {m.body && <p className="whitespace-pre-wrap break-words">{m.body}</p>}
                  <span
                    className={`mt-1 block text-right text-[10px] ${isOwn ? "text-paper/65" : "text-ink/35"}`}
                  >
                    <ClientTime iso={m.created_at} format={formatBubbleTime} />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        {!messages.length && (
          <p className="pt-10 text-center text-sm text-ink/40">Say hello to start the conversation.</p>
        )}
        <div ref={bottomRef} />
      </div>

      {error && (
        <p className="mx-4 rounded-lg border border-magenta/40 bg-magenta/10 px-4 py-2.5 text-sm text-magenta">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="border-t border-line px-4 py-3">
        {pendingFile && (
          <div className="mb-2 flex w-fit items-center gap-2 rounded-full border border-line bg-bg px-3 py-1.5 text-xs text-ink/70">
            <Paperclip className="h-3 w-3" />
            <span className="max-w-[180px] truncate">{pendingFile.name}</span>
            <button
              type="button"
              onClick={() => {
                setPendingFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="text-ink/40 hover:text-ink"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <label className="cursor-pointer text-ink/50 hover:text-brand">
            <Paperclip className="h-5 w-5" />
            <input
              ref={fileInputRef}
              type="file"
              name="attachment"
              accept="image/png,image/jpeg,image/webp,image/gif,application/pdf"
              className="hidden"
              onChange={(e) => setPendingFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <input
            name="body"
            placeholder="Write a message…"
            autoComplete="off"
            className="flex-1 rounded-full border border-line bg-transparent px-4 py-2.5 text-sm text-ink outline-none focus:border-brand"
          />
          <button
            type="submit"
            disabled={sending}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-grad-brand text-paper shadow-sm transition hover:opacity-90 disabled:opacity-50"
            aria-label="Send"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
