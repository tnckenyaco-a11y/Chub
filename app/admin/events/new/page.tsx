import { createEvent } from "@/app/admin/events/actions";
import { EventFields } from "@/components/event-fields";

export default async function NewEventPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div>
      <h1 className="font-display text-4xl uppercase text-ink">New Event</h1>
      {error && (
        <p className="mt-6 rounded-lg border border-magenta/40 bg-magenta/10 px-4 py-3 text-sm text-magenta">
          {error}
        </p>
      )}
      <form action={createEvent} className="mt-8 max-w-2xl space-y-5">
        <EventFields />
        <button
          type="submit"
          className="rounded-full bg-grad-brand px-6 py-3 text-sm font-semibold uppercase tracking-wide text-paper shadow-sm transition hover:opacity-90"
        >
          Create Draft
        </button>
      </form>
    </div>
  );
}
