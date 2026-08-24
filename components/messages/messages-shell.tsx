"use client";

import { usePathname } from "next/navigation";
import { ConversationList } from "@/components/messages/conversation-list";

export type ConversationSummary = {
  id: string;
  lastMessageAt: string;
  other: { id: string; name: string; avatarUrl: string | null };
  preview: { body: string; attachmentType: string | null; isOwn: boolean } | null;
};

export function MessagesShell({
  conversations,
  currentUserId,
  children,
}: {
  conversations: ConversationSummary[];
  currentUserId: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const activeId = pathname.match(/^\/dashboard\/messages\/([^/]+)/)?.[1] ?? null;
  const hasActiveThread = Boolean(activeId);

  return (
    <div className="flex h-[75vh] max-h-[46rem] min-h-[420px] overflow-hidden rounded-2xl border border-line bg-paper shadow-sm">
      <div
        className={`w-full shrink-0 flex-col border-line md:flex md:w-80 md:border-r ${
          hasActiveThread ? "hidden md:flex" : "flex"
        }`}
      >
        <ConversationList conversations={conversations} currentUserId={currentUserId} activeId={activeId} />
      </div>

      <div className={`min-w-0 flex-1 flex-col ${hasActiveThread ? "flex" : "hidden md:flex"}`}>{children}</div>
    </div>
  );
}
