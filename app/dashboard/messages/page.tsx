import { MessageCircle } from "lucide-react";

export default function MessagesIndexPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand/8 text-brand">
        <MessageCircle className="h-6 w-6" />
      </span>
      <p className="font-medium text-ink">Select a conversation</p>
      <p className="max-w-xs text-sm text-ink/50">Choose someone from the list to see your message history.</p>
    </div>
  );
}
