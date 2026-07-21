import { createClient } from "@/lib/supabase/server";
import {
  addCategory,
  deleteCategory,
  addFocusArea,
  deleteFocusArea,
} from "@/app/admin/categories/actions";

export default async function AdminCategoriesPage() {
  const supabase = await createClient();
  const [{ data: categories }, { data: focusAreas }] = await Promise.all([
    supabase.from("categories").select("id, name").order("sort_order"),
    supabase.from("focus_areas").select("id, name").order("sort_order"),
  ]);

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Categories</h1>

      <div className="mt-8 grid gap-12 lg:grid-cols-2">
        <TaxonomyList
          title="Categories"
          items={categories ?? []}
          addAction={addCategory}
          deleteAction={deleteCategory}
        />
        <TaxonomyList
          title="Focus Areas"
          items={focusAreas ?? []}
          addAction={addFocusArea}
          deleteAction={deleteFocusArea}
        />
      </div>
    </div>
  );
}

function TaxonomyList({
  title,
  items,
  addAction,
  deleteAction,
}: {
  title: string;
  items: { id: string; name: string }[];
  addAction: (formData: FormData) => Promise<void>;
  deleteAction: (id: string) => Promise<void>;
}) {
  return (
    <div>
      <h2 className="text-xs font-semibold uppercase tracking-wide text-ink/50">{title}</h2>
      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between rounded-xl border border-line bg-paper px-4 py-2.5 shadow-sm"
          >
            <span className="font-medium text-ink">{item.name}</span>
            <form
              action={async () => {
                "use server";
                await deleteAction(item.id);
              }}
            >
              <button
                type="submit"
                className="text-xs uppercase tracking-wide text-ink/40 hover:text-magenta"
              >
                Remove
              </button>
            </form>
          </li>
        ))}
        {!items.length && <p className="text-sm text-ink/40">None yet.</p>}
      </ul>

      <form action={addAction} className="mt-4 flex gap-2">
        <input
          name="name"
          placeholder="New name…"
          required
          className="flex-1 rounded-lg border border-line bg-paper px-4 py-2.5 text-sm text-ink outline-none focus:border-brand"
        />
        <button
          type="submit"
          className="rounded-lg bg-grad-brand px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-paper shadow-sm transition hover:opacity-90"
        >
          Add
        </button>
      </form>
    </div>
  );
}
