import { forbidden } from "next/navigation";
import { requireProfile } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";
import { createProject } from "@/app/dashboard/projects/actions";

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const profile = await requireProfile();
  if (profile.role !== "brand") forbidden();
  const { error } = await searchParams;

  const supabase = await createClient();
  const [{ data: categories }, { data: focusAreas }] = await Promise.all([
    supabase.from("categories").select("id, name").order("sort_order"),
    supabase.from("focus_areas").select("id, name").order("sort_order"),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 lg:px-10">
      <h1 className="font-display text-3xl text-ink">Post a Project</h1>
      <p className="mt-2 text-sm text-ink/50">
        Your project goes live once an admin reviews and approves it.
      </p>

      {error && (
        <p className="mt-6 rounded-lg border border-magenta/40 bg-magenta/10 px-4 py-3 text-sm text-magenta">
          {error}
        </p>
      )}

      <form action={createProject} className="mt-8 space-y-6">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">
            Title
          </span>
          <input
            name="title"
            required
            placeholder="e.g. Videographer needed for product launch"
            className="mt-1.5 w-full rounded-lg border border-line bg-transparent px-4 py-2.5 text-ink outline-none focus:border-brand"
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">
            Description
          </span>
          <textarea
            name="description"
            rows={5}
            className="mt-1.5 w-full rounded-lg border border-line bg-transparent px-4 py-3 text-ink outline-none focus:border-brand"
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">
            Category
          </span>
          <select
            name="category_id"
            className="mt-1.5 w-full rounded-lg border border-line bg-paper px-4 py-2.5 text-ink outline-none focus:border-brand"
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
          <legend className="text-xs font-semibold uppercase tracking-wide text-ink/50">
            Focus Areas
          </legend>
          <div className="mt-2 flex flex-wrap gap-3">
            {focusAreas?.map((f) => (
              <label
                key={f.id}
                className="flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-xs text-ink/70 has-[:checked]:border-brand has-[:checked]:text-brand"
              >
                <input type="checkbox" name="focus_area_ids" value={f.id} className="sr-only" />
                {f.name}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="flex gap-2 rounded-full border border-line p-1 w-fit">
          <legend className="sr-only">Pricing type</legend>
          {(["fixed", "hourly"] as const).map((value) => (
            <label
              key={value}
              className="cursor-pointer rounded-full px-4 py-2 text-center text-xs font-semibold uppercase tracking-wide transition has-[:checked]:bg-grad-brand has-[:checked]:text-paper has-[:checked]:shadow-sm"
            >
              <input
                type="radio"
                name="pricing_type"
                value={value}
                defaultChecked={value === "fixed"}
                className="sr-only"
              />
              {value === "fixed" ? "Fixed Price" : "Hourly Rate"}
            </label>
          ))}
        </fieldset>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-xs text-ink/50">Budget min (KES)</span>
            <input
              name="budget_min"
              type="number"
              min={0}
              required
              className="mt-1.5 w-full rounded-lg border border-line bg-transparent px-4 py-2.5 text-ink outline-none focus:border-brand"
            />
          </label>
          <label className="block">
            <span className="text-xs text-ink/50">Budget max (KES)</span>
            <input
              name="budget_max"
              type="number"
              min={0}
              required
              className="mt-1.5 w-full rounded-lg border border-line bg-transparent px-4 py-2.5 text-ink outline-none focus:border-brand"
            />
          </label>
        </div>

        <button
          type="submit"
          className="rounded-full bg-grad-brand px-6 py-3 text-sm font-semibold uppercase tracking-wide text-paper shadow-sm transition hover:opacity-90"
        >
          Submit for Review
        </button>
      </form>
    </div>
  );
}
