import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deleteEvent, togglePublish, updateEvent } from "@/app/admin/events/actions";
import { EventFields } from "@/components/event-fields";

export default async function EditEventPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { id } = await params;
  const { saved, error } = await searchParams;
  const supabase = await createClient();
  const { data: event } = await supabase
    .from("events")
    .select(
      "id, title, event_type, location, starts_at, ends_at, registration_url, excerpt, body, cover_image_url, status"
    )
    .eq("id", id)
    .maybeSingle();

  if (!event) notFound();

  const update = updateEvent.bind(null, id);
  const publish = togglePublish.bind(null, id, event.status !== "published");
  const remove = deleteEvent.bind(null, id);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl uppercase text-ink">Edit Event</h1>
        <span
          className={
            event.status === "published" ? "text-xs uppercase text-green" : "text-xs uppercase text-ink/40"
          }
        >
          {event.status}
        </span>
      </div>

      {saved && (
        <p className="mt-6 rounded-lg border border-green/40 bg-green/10 px-4 py-3 text-sm text-green">
          Saved.
        </p>
      )}
      {error && (
        <p className="mt-6 rounded-lg border border-magenta/40 bg-magenta/10 px-4 py-3 text-sm text-magenta">
          {error}
        </p>
      )}

      <form action={update} className="mt-8 max-w-2xl space-y-5">
        <EventFields defaults={event} />
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-full bg-grad-brand px-6 py-3 text-sm font-semibold uppercase tracking-wide text-paper shadow-sm transition hover:opacity-90"
          >
            Save
          </button>
        </div>
      </form>

      <div className="mt-6 flex flex-wrap gap-3">
        <form action={publish}>
          <button
            type="submit"
            className="rounded-full border border-line px-6 py-3 text-sm font-semibold uppercase tracking-wide text-ink hover:border-ink"
          >
            {event.status === "published" ? "Unpublish" : "Publish"}
          </button>
        </form>
        <form action={remove}>
          <button
            type="submit"
            className="rounded-full border border-magenta/40 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-magenta hover:border-magenta"
          >
            Delete
          </button>
        </form>
      </div>
    </div>
  );
}
