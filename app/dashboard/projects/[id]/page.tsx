import Link from "next/link";
import { forbidden, notFound } from "next/navigation";
import { requireProfile } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";
import {
  addProjectImage,
  closeProject,
  decideProposal,
  deleteProject,
  deleteProjectImage,
  updateProject,
} from "@/app/dashboard/projects/actions";
import { initiateProposalCheckout } from "@/app/checkout/actions";
import { AutoSubmitFileInput } from "@/components/auto-submit-file-input";

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

  const [{ data: project }, { data: categories }, { data: proposals }, { data: images }] =
    await Promise.all([
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
      supabase
        .from("project_images")
        .select("id, file_url")
        .eq("project_id", id)
        .order("sort_order"),
    ]);

  if (!project || project.brand_id !== profile.id) notFound();

  const acceptedProposalIds = (proposals ?? [])
    .filter((p) => p.status === "accepted")
    .map((p) => p.id);
  const { data: existingOrders } = acceptedProposalIds.length
    ? await supabase.from("orders").select("id, proposal_id").in("proposal_id", acceptedProposalIds)
    : { data: [] };
  const orderByProposal = new Map((existingOrders ?? []).map((o) => [o.proposal_id, o.id]));

  const update = updateProject.bind(null, id);
  const close = closeProject.bind(null, id);
  const remove = deleteProject.bind(null, id);
  const addImage = addProjectImage.bind(null, id);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl uppercase text-ink">Edit Project</h1>
        <span className="text-xs uppercase text-ink/50">{project.status.replace("_", " ")}</span>
      </div>

      {saved && (
        <p className="mt-6 rounded-lg border border-volt/40 bg-volt/10 px-4 py-3 text-sm text-volt">
          Saved. Changes to a published project go back through review.
        </p>
      )}

      <form action={update} className="mt-8 max-w-2xl space-y-5">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">
            Title
          </span>
          <input
            name="title"
            defaultValue={project.title}
            required
            className="mt-1.5 w-full rounded-lg border border-line bg-transparent px-4 py-2.5 text-ink outline-none focus:border-volt"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">
            Description
          </span>
          <textarea
            name="description"
            defaultValue={project.description}
            rows={5}
            className="mt-1.5 w-full rounded-lg border border-line bg-transparent px-4 py-3 text-ink outline-none focus:border-volt"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">
            Category
          </span>
          <select
            name="category_id"
            defaultValue={project.category_id ?? ""}
            className="mt-1.5 w-full rounded-lg border border-line bg-paper px-4 py-2.5 text-ink outline-none focus:border-volt"
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

      <section className="mt-14 max-w-2xl">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/50">Images</h2>
        <div className="mt-4 grid grid-cols-3 gap-4 sm:grid-cols-4">
          {images?.map((img) => {
            const removeImg = deleteProjectImage.bind(null, id, img.id);
            return (
              <div key={img.id} className="overflow-hidden rounded-xl border border-line">
                <div
                  className="h-24 bg-cover bg-center"
                  style={{ backgroundImage: `url(${img.file_url})` }}
                />
                <form action={removeImg}>
                  <button
                    type="submit"
                    className="w-full py-1.5 text-xs text-ink/40 hover:text-magenta"
                  >
                    Remove
                  </button>
                </form>
              </div>
            );
          })}
        </div>
        <form action={addImage} className="mt-4">
          <AutoSubmitFileInput name="file" accept="image/png,image/jpeg,image/webp,image/gif" />
        </form>
        <p className="mt-2 text-xs text-ink/40">Add reference photos for this project. Max file size 10MB.</p>
      </section>

      <section className="mt-14">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/50">
          Proposals ({proposals?.length ?? 0})
        </h2>
        <div className="mt-4 space-y-4">
          {proposals?.map((p) => {
            const accept = decideProposal.bind(null, p.id, "accepted");
            const reject = decideProposal.bind(null, p.id, "rejected");
            return (
              <div key={p.id} className="rounded-2xl border border-line p-5">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-ink">
                    {p.creative?.first_name} {p.creative?.last_name}
                  </p>
                  <p className="text-sm text-volt">Ksh {p.rate.toLocaleString()}</p>
                </div>
                {p.message && <p className="mt-2 text-sm text-ink/60">{p.message}</p>}
                <p className="mt-3 text-xs uppercase text-ink/40">{p.status}</p>
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
                {p.status === "accepted" && (
                  <div className="mt-4">
                    {orderByProposal.has(p.id) ? (
                      <Link
                        href={`/dashboard/orders/${orderByProposal.get(p.id)}`}
                        className="text-xs font-semibold uppercase tracking-wide text-volt hover:underline"
                      >
                        View Order →
                      </Link>
                    ) : (
                      <form action={initiateProposalCheckout.bind(null, p.id)} className="space-y-2">
                        <input
                          name="phone_number"
                          required
                          placeholder="M-Pesa phone (07XXXXXXXX)"
                          className="w-full rounded-lg border border-line bg-transparent px-4 py-2 text-sm text-ink outline-none focus:border-volt"
                        />
                        <button
                          type="submit"
                          className="rounded-full bg-volt px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-ink"
                        >
                          Pay &amp; Start (Ksh {p.rate.toLocaleString()})
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {!proposals?.length && <p className="text-sm text-ink/40">No proposals yet.</p>}
        </div>
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <form action={close}>
          <button
            type="submit"
            className="rounded-full border border-line px-6 py-3 text-sm font-semibold uppercase tracking-wide text-ink hover:border-ink"
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
