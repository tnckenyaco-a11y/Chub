import { forbidden, notFound } from "next/navigation";
import { requireProfile } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";
import {
  closeProject,
  decideProposal,
  deleteProject,
  updateProject,
} from "@/app/dashboard/projects/actions";

export default async function EditProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const profile = await requireProfile();
  if (profile.role !== "brand") forbidden();

  const { id } = await params;
  const { saved } = await searchParams;
  const supabase = await createClient();

  const [{ data: project }, { data: categories }, { data: proposals }] = await Promise.all([
    supabase
      .from("projects")
      .select("id, title, description, category_id, status, brand_id")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("categories").select("id, name").order("sort_order"),
    supabase
      .from("proposals")
      .select(
        "id, message, rate, status, created_at, creative:profiles!proposals_creative_id_fkey(username, first_name, last_name)"
      )
      .eq("project_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (!project || project.brand_id !== profile.id) notFound();

  const update = updateProject.bind(null, id);
  const close = closeProject.bind(null, id);
  const remove = deleteProject.bind(null, id);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl uppercase text-paper">Edit Project</h1>
        <span className="text-xs uppercase text-paper/50">{project.status.replace("_", " ")}</span>
      </div>

      {saved && (
        <p className="mt-6 rounded-lg border border-volt/40 bg-volt/10 px-4 py-3 text-sm text-volt">
          Saved. Changes to a published project go back through review.
        </p>
      )}

      <form action={update} className="mt-8 max-w-2xl space-y-5">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-paper/50">
            Title
          </span>
          <input
            name="title"
            defaultValue={project.title}
            required
            className="mt-1.5 w-full rounded-lg border border-line bg-transparent px-4 py-2.5 text-paper outline-none focus:border-volt"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-paper/50">
            Description
          </span>
          <textarea
            name="description"
            defaultValue={project.description}
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
            defaultValue={project.category_id ?? ""}
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
        <button
          type="submit"
          className="rounded-full bg-volt px-6 py-3 text-sm font-semibold uppercase tracking-wide text-ink"
        >
          Save
        </button>
      </form>

      <section className="mt-14">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-paper/50">
          Proposals ({proposals?.length ?? 0})
        </h2>
        <div className="mt-4 space-y-4">
          {proposals?.map((p) => {
            const accept = decideProposal.bind(null, p.id, "accepted");
            const reject = decideProposal.bind(null, p.id, "rejected");
            return (
              <div key={p.id} className="rounded-2xl border border-line p-5">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-paper">
                    {p.creative?.first_name} {p.creative?.last_name}
                  </p>
                  <p className="text-sm text-volt">Ksh {p.rate.toLocaleString()}</p>
                </div>
                {p.message && <p className="mt-2 text-sm text-paper/60">{p.message}</p>}
                <p className="mt-3 text-xs uppercase text-paper/40">{p.status}</p>
                {p.status === "pending" && (
                  <div className="mt-4 flex gap-3">
                    <form action={accept}>
                      <button
                        type="submit"
                        className="rounded-full bg-volt px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-ink"
                      >
                        Accept
                      </button>
                    </form>
                    <form action={reject}>
                      <button
                        type="submit"
                        className="rounded-full border border-magenta/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-magenta"
                      >
                        Reject
                      </button>
                    </form>
                  </div>
                )}
              </div>
            );
          })}
          {!proposals?.length && <p className="text-sm text-paper/40">No proposals yet.</p>}
        </div>
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <form action={close}>
          <button
            type="submit"
            className="rounded-full border border-line px-6 py-3 text-sm font-semibold uppercase tracking-wide text-paper hover:border-paper"
          >
            Close Project
          </button>
        </form>
        <form action={remove}>
          <button
            type="submit"
            className="rounded-full border border-magenta/40 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-magenta hover:border-magenta"
          >
            Delete Project
          </button>
        </form>
      </div>
    </div>
  );
}
