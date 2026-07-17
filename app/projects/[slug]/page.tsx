import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/current-user";
import { submitProposal } from "@/app/proposals/actions";

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const { slug } = await params;
  const { error, sent } = await searchParams;
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const { data: project } = await supabase
    .from("projects")
    .select(
      "id, title, description, pricing_type, budget_min, budget_max, categories(name), brand:profiles!projects_brand_id_fkey(first_name, last_name, city)"
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!project) notFound();

  let myProposal = null;
  if (profile?.role === "creative") {
    const { data } = await supabase
      .from("proposals")
      .select("id, status")
      .eq("project_id", project.id)
      .eq("creative_id", profile.id)
      .maybeSingle();
    myProposal = data;
  }

  const submit = submitProposal.bind(null, slug);

  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[1.4fr_1fr] lg:px-10">
      <div>
        {project.categories && (
          <p className="text-xs font-semibold uppercase tracking-wide text-volt">
            {project.categories.name}
          </p>
        )}
        <h1 className="font-display mt-2 text-4xl uppercase text-ink sm:text-5xl">
          {project.title}
        </h1>
        {project.brand && (
          <p className="mt-4 text-sm text-ink/60">
            Posted by {project.brand.first_name} {project.brand.last_name}
            {project.brand.city ? ` · ${project.brand.city}` : ""}
          </p>
        )}
        <p className="mt-8 whitespace-pre-wrap leading-relaxed text-ink/70">
          {project.description}
        </p>
      </div>

      <div>
        <div className="rounded-2xl border border-line p-6">
          <p className="text-xs uppercase tracking-wide text-ink/40">
            {project.pricing_type === "fixed" ? "Fixed Price" : "Hourly Rate"}
          </p>
          <p className="font-display mt-2 text-2xl text-volt">
            Ksh {project.budget_min.toLocaleString()} – {project.budget_max.toLocaleString()}
          </p>
        </div>

        {error && (
          <p className="mt-4 rounded-lg border border-magenta/40 bg-magenta/10 px-4 py-3 text-sm text-magenta">
            {error}
          </p>
        )}
        {sent && (
          <p className="mt-4 rounded-lg border border-volt/40 bg-volt/10 px-4 py-3 text-sm text-volt">
            Proposal sent.
          </p>
        )}

        {profile?.role === "creative" ? (
          myProposal ? (
            <p className="mt-6 text-sm text-ink/60">
              You already sent a proposal — status:{" "}
              <span className="uppercase text-volt">{myProposal.status}</span>
            </p>
          ) : (
            <form action={submit} className="mt-6 space-y-4">
              <input type="hidden" name="project_id" value={project.id} />
              <label className="block">
                <span className="text-xs text-ink/50">Your rate (KES)</span>
                <input
                  name="rate"
                  type="number"
                  min={0}
                  required
                  className="mt-1.5 w-full rounded-lg border border-line bg-transparent px-4 py-2.5 text-ink outline-none focus:border-volt"
                />
              </label>
              <label className="block">
                <span className="text-xs text-ink/50">Message</span>
                <textarea
                  name="message"
                  rows={4}
                  className="mt-1.5 w-full rounded-lg border border-line bg-transparent px-4 py-3 text-ink outline-none focus:border-volt"
                />
              </label>
              <button
                type="submit"
                className="w-full rounded-full bg-volt px-5 py-3 text-sm font-semibold uppercase tracking-wide text-ink"
              >
                Send Proposal
              </button>
            </form>
          )
        ) : (
          <p className="mt-6 text-sm text-ink/40">
            Sign in as a creative to send a proposal.
          </p>
        )}
      </div>
    </div>
  );
}
