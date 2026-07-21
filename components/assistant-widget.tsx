"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send } from "lucide-react";

type DisplayMessage = { role: "user" | "assistant"; text: string };
type ApiMessage = { role: "user" | "assistant"; content: unknown };

export function AssistantWidget({ role }: { role: string }) {
  const [open, setOpen] = useState(false);
  const [displayMessages, setDisplayMessages] = useState<DisplayMessage[]>([
    {
      role: "assistant",
      text:
        role === "creative"
          ? "Hi! I'm Nyx. Ask me about your orders, proposals, or earnings — I can also send a proposal or move an order forward for you."
          : "Hi! I'm Nyx. Ask me about your orders, or I can approve and release payment on a delivered order for you.",
    },
  ]);
  const [apiMessages, setApiMessages] = useState<ApiMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [displayMessages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setDisplayMessages((prev) => [...prev, { role: "user", text }]);
    setLoading(true);

    const nextApiMessages = [...apiMessages, { role: "user" as const, content: text }];

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextApiMessages }),
      });
      const data = await res.json();

      if (!res.ok) {
        setDisplayMessages((prev) => [
          ...prev,
          { role: "assistant", text: data.error ?? "Something went wrong. Try again." },
        ]);
        return;
      }

      setApiMessages(data.messages ?? nextApiMessages);
      setDisplayMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.reply || "…" },
      ]);
    } catch {
      setDisplayMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Couldn't reach the assistant. Check your connection and try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-3 flex h-[28rem] w-80 flex-col overflow-hidden rounded-2xl border border-line bg-paper shadow-xl sm:w-96">
          <div className="flex items-center justify-between bg-grad-brand px-4 py-3">
            <div className="flex items-center gap-2 text-paper">
              <Sparkles className="h-4 w-4" />
              <span className="font-display text-sm">Nyx Assistant</span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close assistant"
              className="text-paper/80 hover:text-paper"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {displayMessages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm ${
                  m.role === "user"
                    ? "ml-auto bg-grad-brand text-paper"
                    : "border border-line bg-bg text-ink/80"
                }`}
              >
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="max-w-[85%] rounded-2xl border border-line bg-bg px-3.5 py-2 text-sm text-ink/40">
                Thinking…
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 border-t border-line p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Ask about an order, proposal…"
              className="flex-1 rounded-full border border-line bg-transparent px-3.5 py-2 text-sm text-ink outline-none focus:border-brand"
            />
            <button
              type="button"
              onClick={send}
              disabled={loading || !input.trim()}
              aria-label="Send"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-grad-brand text-paper disabled:opacity-40"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close assistant" : "Open assistant"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-grad-brand text-paper shadow-lg transition hover:opacity-90"
      >
        <Sparkles className="h-5 w-5" />
      </button>
    </div>
  );
}
