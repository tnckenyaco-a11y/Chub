function toLocalInputValue(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function EventFields({
  defaults,
}: {
  defaults?: {
    title?: string;
    event_type?: string;
    location?: string | null;
    starts_at?: string;
    ends_at?: string | null;
    registration_url?: string | null;
    excerpt?: string | null;
    body?: string | null;
    cover_image_url?: string | null;
  };
}) {
  return (
    <>
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">
          Title
        </span>
        <input
          name="title"
          required
          defaultValue={defaults?.title}
          className="mt-1.5 w-full rounded-lg border border-line bg-transparent px-4 py-2.5 text-ink outline-none focus:border-volt"
        />
      </label>

      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">
          Type
        </span>
        <select
          name="event_type"
          defaultValue={defaults?.event_type ?? "event"}
          className="mt-1.5 w-full rounded-lg border border-line bg-transparent px-4 py-2.5 text-ink outline-none focus:border-volt"
        >
          <option value="event">Event</option>
          <option value="workshop">Workshop</option>
        </select>
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">
            Starts
          </span>
          <input
            type="datetime-local"
            name="starts_at"
            required
            defaultValue={toLocalInputValue(defaults?.starts_at)}
            className="mt-1.5 w-full rounded-lg border border-line bg-transparent px-4 py-2.5 text-ink outline-none focus:border-volt"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">
            Ends (optional)
          </span>
          <input
            type="datetime-local"
            name="ends_at"
            defaultValue={toLocalInputValue(defaults?.ends_at)}
            className="mt-1.5 w-full rounded-lg border border-line bg-transparent px-4 py-2.5 text-ink outline-none focus:border-volt"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">
          Location
        </span>
        <input
          name="location"
          placeholder="e.g. Nairobi, Kenya or Online"
          defaultValue={defaults?.location ?? ""}
          className="mt-1.5 w-full rounded-lg border border-line bg-transparent px-4 py-2.5 text-ink outline-none focus:border-volt"
        />
      </label>

      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">
          Registration URL (optional)
        </span>
        <input
          name="registration_url"
          placeholder="https://..."
          defaultValue={defaults?.registration_url ?? ""}
          className="mt-1.5 w-full rounded-lg border border-line bg-transparent px-4 py-2.5 text-ink outline-none focus:border-volt"
        />
      </label>

      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">
          Cover image URL
        </span>
        <input
          name="cover_image_url"
          defaultValue={defaults?.cover_image_url ?? ""}
          className="mt-1.5 w-full rounded-lg border border-line bg-transparent px-4 py-2.5 text-ink outline-none focus:border-volt"
        />
      </label>

      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">
          Excerpt
        </span>
        <textarea
          name="excerpt"
          rows={2}
          defaultValue={defaults?.excerpt ?? ""}
          className="mt-1.5 w-full rounded-lg border border-line bg-transparent px-4 py-2.5 text-ink outline-none focus:border-volt"
        />
      </label>

      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">
          Full description
        </span>
        <textarea
          name="body"
          rows={10}
          defaultValue={defaults?.body ?? ""}
          className="mt-1.5 w-full rounded-lg border border-line bg-transparent px-4 py-3 text-ink outline-none focus:border-volt"
        />
      </label>
    </>
  );
}
