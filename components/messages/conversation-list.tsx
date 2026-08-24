"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Image as ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { ConversationSummary } from "@/components/messages/messages-shell";
import { formatListTimestamp } from "@/components/messages/format-timestamp";
import { ClientTime } from "@/components/messages/client-time";

type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  attachment_type: string | null;
  created_at: string;
};

export function ConversationList({
  conversations,
  currentUserId,
  activeId,
}: {
  conversations: ConversationSummary[];
  currentUserId: string;
  activeId: string | null;
}) {
  const [items, setItems] = useState(conversations);

  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    // Awaiting getSession() first ensures the realtime client has attached
    // the session JWT before we join — joining too early subscribes as
    // anonymous, and RLS then silently filters out every event.
    supabase.auth.getSession().then(() => {
      if (cancelled) return;
      channel = supabase
        .channel(`inbox:${currentUserId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages" },
          (payload) => {
            const m = payload.new as MessageRow;
            setItems((prev) => {
              const idx = prev.findIndex((c) => c.id === m.conversation_id);
              if (idx === -1) return prev;
              const updated: ConversationSummary = {
                ...prev[idx],
                lastMessageAt: m.created_at,
                preview: {
                  body: m.body,
                  attachmentType: m.attachment_type,
                  isOwn: m.sender_id === currentUserId,
                },
              };
              const next = prev.filter((_, i) => i !== idx);
              next.unshift(updated);
              return next;
            });
          }
        )
        .subscribe();
    });

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-line px-4 py-4">
        <h1 className="font-display text-xl text-ink">Messages</h1>
      </div>

      <ul className="flex-1 overflow-y-auto">
        {items.map((c) => {
          const initials =
            c.other.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase() || "?";
          const active = c.id === activeId;

          return (
            <li key={c.id}>
              <Link
                href={`/dashboard/messages/${c.id}`}
                className={`flex items-center gap-3 border-b border-line/60 px-4 py-3 transition ${
                  active ? "bg-brand/8" : "hover:bg-bg"
                }`}
              >
                <span
                  className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-grad-brand bg-cover bg-center text-xs font-bold text-paper"
                  style={c.other.avatarUrl ? { backgroundImage: `url(${c.other.avatarUrl})` } : undefined}
                >
                  {!c.other.avatarUrl && (
                    <span className="flex h-full w-full items-center justify-center">{initials}</span>
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-ink">{c.other.name}</p>
                    <span className="shrink-0 text-[11px] text-ink/40">
                      <ClientTime iso={c.lastMessageAt} format={formatListTimestamp} />
                    </span>
                  </div>
                  <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-ink/50">
                    {c.preview?.isOwn && <span className="text-ink/40">You:</span>}
                    {c.preview?.attachmentType === "image" && (
                      <span className="flex items-center gap-1">
                        <ImageIcon className="h-3 w-3" /> Photo
                      </span>
                    )}
                    {c.preview?.attachmentType === "pdf" && (
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" /> PDF
                      </span>
                    )}
                    {!c.preview?.attachmentType && (c.preview?.body || "Say hello to start the conversation.")}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
        {!items.length && (
          <p className="px-4 py-6 text-sm text-ink/40">No conversations yet.</p>
        )}
      </ul>
    </div>
  );
}
