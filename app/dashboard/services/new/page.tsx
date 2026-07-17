import { forbidden } from "next/navigation";
import { requireProfile } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";
import { createService } from "@/app/dashboard/services/actions";

export default async function NewServicePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const profile = await requireProfile();
  if (profile.role !== "creative") forbidden();
  const { error } = await searchParams;

  const supabase = await createClient();
  const [{ data: categories }, { data: focusAreas }] = await Promise.all([
    supabase.from("categories").select("id, name").order("sort_order"),
    supabase.from("focus_areas").select("id, name").order("sort_order"),
  ]);

  return (
    <div>
      <h1 className="font-display text-4xl uppercase text-paper">New Service</h1>
      <p className="mt-2 text-sm text-paper/50">
        Your service goes live once an admin reviews and approves it.
      </p>

      {error && (
        <p className="mt-6 rounded-lg border border-magenta/40 bg-magenta/10 px-4 py-3 text-sm text-magenta">
          {error}
        </p>
      )}

      <form action={createService} className="mt-8 max-w-2xl space-y-6">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-paper/50">
            Title
          </span>
          <input
            name="title"
            required
            placeholder="e.g. I will produce a 30-second product commercial"
            className="mt-1.5 w-full rounded-lg border border-line bg-transparent px-4 py-2.5 text-paper outline-none focus:border-volt"
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-paper/50">
            Description
          </span>
          <textarea
            name="description"
            rows={5}
            className="mt-1.5 w-full rounded-lg border border-line bg-transparent px-4 py-3 text-paper outline-none focus:border-volt"
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-paper/50">
            Category
          </span>
          <select
            name="category_id"
            className="mt-1.5 w-full rounded-lg border border-line bg-ink px-4 py-2.5 text-paper outline-none focus:border-volt"
          >
            <option value="">Select a category</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <fieldset>
          <legend className="text-xs font-semibold uppercase tracking-wide text-paper/50">
            Focus Areas
          </legend>
          <div className="mt-2 flex flex-wrap gap-3">
            {focusAreas?.map((f) => (
              <label
                key={f.id}
                className="flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-xs text-paper/70 has-[:checked]:border-volt has-[:checked]:text-volt"
              >
                <input type="checkbox" name="focus_area_ids" value={f.id} className="sr-only" />
                {f.name}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="rounded-2xl border border-line p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-paper/50">
            Starting Package
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs text-paper/50">Package name</span>
              <input
                name="package_title"
                defaultValue="Standard"
                className="mt-1.5 w-full rounded-lg border border-line bg-transparent px-4 py-2.5 text-paper outline-none focus:border-volt"
              />
            </label>
            <label className="block">
              <span className="text-xs text-paper/50">Price (KES)</span>
              <input
                name="price_kes"
                type="number"
                min={0}
                required
                className="mt-1.5 w-full rounded-lg border border-line bg-transparent px-4 py-2.5 text-paper outline-none focus:border-volt"
              />
            </label>
            <label className="block">
              <span className="text-xs text-paper/50">Delivery time (days)</span>
              <input
                name="delivery_days"
                type="number"
                min={1}
                required
                className="mt-1.5 w-full rounded-lg border border-line bg-transparent px-4 py-2.5 text-paper outline-none focus:border-volt"
              />
            </label>
            <label className="block">
              <span className="text-xs text-paper/50">Revisions</span>
              <input
                name="revisions"
                type="number"
                min={0}
                defaultValue={1}
                className="mt-1.5 w-full rounded-lg border border-line bg-transparent px-4 py-2.5 text-paper outline-none focus:border-volt"
              />
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="rounded-full bg-volt px-6 py-3 text-sm font-semibold uppercase tracking-wide text-ink"
        >
          Submit for Review
        </button>
      </form>
    </div>
  );
}
