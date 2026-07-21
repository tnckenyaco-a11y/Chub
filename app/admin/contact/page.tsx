import { Mail, MailOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { markContactMessageRead } from "@/app/admin/contact/actions";

const inquiryLabel: Record<string, string> = {
  brand: "Brand",
  creative: "Creative",
  press: "Press / Partnership",
  other: "Other",
};

export default async function AdminContactPage() {
  const supabase = await createClient();
  const { data: messages } = await supabase
    .from("contact_messages")
    .select("id, name, email, inquiry_type, message, is_read, created_at")
    .order("created_at", { ascending: false });

  const unreadCount = messages?.filter((m) => !m.is_read).length ?? 0;

  return (
    <div>
      <div className="flex items-center gap-3">
        <h1 className="font-display text-3xl text-ink">Messages</h1>
        {unreadCount > 0 && (
          <span className="rounded-full bg-grad-volt px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-ink">
            {unreadCount} unread
          </span>
        )}
      </div>
      <p className="mt-2 text-sm text-ink/50">Submissions from the public contact form.</p>

      <div className="mt-8 space-y-3">
        {messages?.map((m) => {
          const toggleRead = markContactMessageRead.bind(null, m.id, !m.is_read);
          return (
            <div
              key={m.id}
              className={`rounded-2xl border p-5 shadow-sm ${
                m.is_read ? "border-line bg-paper" : "border-brand/30 bg-brand/[0.03]"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-ink">{m.name}</p>
                    <span className="rounded-full bg-ink/8 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-ink/55">
                      {inquiryLabel[m.inquiry_type] ?? m.inquiry_type}
                    </span>
                  </div>
                  <a href={`mailto:${m.email}`} className="text-xs text-brand hover:underline">
                    {m.email}
                  </a>
                </div>
                <form action={toggleRead}>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-ink/60 transition hover:border-brand hover:text-brand"
                  >
                    {m.is_read ? <MailOpen className="h-3.5 w-3.5" /> : <Mail className="h-3.5 w-3.5" />}
                    {m.is_read ? "Mark unread" : "Mark read"}
                  </button>
                </form>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink/70">{m.message}</p>
              <p className="mt-3 text-xs text-ink/35">
                {new Date(m.created_at).toLocaleString("en", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
          );
        })}
        {!messages?.length && <p className="text-sm text-ink/40">No messages yet.</p>}
      </div>
    </div>
  );
}
