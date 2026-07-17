export function PostFields({
  defaults,
}: {
  defaults?: {
    title?: string;
    category?: string | null;
    excerpt?: string | null;
    body?: string;
    cover_image_url?: string | null;
  };
}) {
  return (
    <>
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wide text-paper/50">
          Title
        </span>
        <input
          name="title"
          required
          defaultValue={defaults?.title}
          className="mt-1.5 w-full rounded-lg border border-line bg-transparent px-4 py-2.5 text-paper outline-none focus:border-volt"
        />
      </label>
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wide text-paper/50">
          Category
        </span>
        <input
          name="category"
          defaultValue={defaults?.category ?? ""}
          className="mt-1.5 w-full rounded-lg border border-line bg-transparent px-4 py-2.5 text-paper outline-none focus:border-volt"
        />
      </label>
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wide text-paper/50">
          Cover image URL
        </span>
        <input
          name="cover_image_url"
          defaultValue={defaults?.cover_image_url ?? ""}
          className="mt-1.5 w-full rounded-lg border border-line bg-transparent px-4 py-2.5 text-paper outline-none focus:border-volt"
        />
      </label>
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wide text-paper/50">
          Excerpt
        </span>
        <textarea
          name="excerpt"
          rows={2}
          defaultValue={defaults?.excerpt ?? ""}
          className="mt-1.5 w-full rounded-lg border border-line bg-transparent px-4 py-2.5 text-paper outline-none focus:border-volt"
        />
      </label>
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wide text-paper/50">
          Body
        </span>
        <textarea
          name="body"
          rows={14}
          defaultValue={defaults?.body}
          className="mt-1.5 w-full rounded-lg border border-line bg-transparent px-4 py-3 text-paper outline-none focus:border-volt"
        />
      </label>
    </>
  );
}
