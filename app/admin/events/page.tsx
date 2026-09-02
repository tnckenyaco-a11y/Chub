import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";

export default async function AdminEventsPage() {
  const supabase = await createClient();
  const { data: events } = await supabase
    .from("events")
    .select("id, title, event_type, status, starts_at")
    .order("starts_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-ink">Events &amp; Workshops</h1>
        <Link
          href="/admin/events/new"
          className="rounded-full bg-grad-brand px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-paper shadow-sm transition hover:opacity-90"
        >
          New Event
        </Link>
      </div>

      <ul className="mt-8 space-y-2">
        {events?.map((e) => (
          <li key={e.id}>
            <Link
              href={`/admin/events/${e.id}`}
              className="flex items-center justify-between rounded-xl border border-line bg-paper px-5 py-3.5 transition hover:-translate-y-0.5 hover:border-brand hover:shadow-sm"
            >
              <div>
                <span className="font-medium text-ink">{e.title}</span>
                <span className="ml-3 text-xs uppercase tracking-wide text-ink/40">
                  {e.event_type} · {formatDate(e.starts_at)}
                </span>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${
                  e.status === "published" ? "bg-green/10 text-green" : "bg-ink/8 text-ink/55"
                }`}
              >
                {e.status}
              </span>
            </Link>
          </li>
        ))}
        {!events?.length && <p className="text-sm text-ink/40">No events yet.</p>}
      </ul>
    </div>
  );
}
