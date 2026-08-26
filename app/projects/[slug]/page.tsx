import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FileText, Tag, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/current-user";
import { submitProposal } from "@/app/proposals/actions";
import { ImageGallery } from "@/components/image-gallery";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("title, description, project_images(file_url, sort_order)")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!project) return {};

  const description = project.description?.slice(0, 160);
  const image = [...(project.project_images ?? [])].sort((a, b) => a.sort_order - b.sort_order)[0]
    ?.file_url;

  return {
    title: project.title,
    description,
    openGraph: { title: project.title, description, images: image ? [image] : undefined },
  };
}

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
      "id, title, description, pricing_type, budget_min, budget_max, brand_id, brief_url, brief_type, categories(name), project_images(file_url, sort_order)"
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!project) notFound();

  const { data: brand } = await supabase
    .from("public_profiles")
    .select("first_name, last_name, city, company_name")
    .eq("id", project.brand_id)
    .maybeSingle();

  const images = [...(project.project_images ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => img.file_url);

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
        {images.length > 0 ? (
          <div className="mb-8">
            <ImageGallery images={images} />
          </div>
        ) : (
          <div className="mb-8 aspect-video rounded-2xl bg-grad-brand" />
        )}
        {project.categories && (
          <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand">
            <Tag className="h-3 w-3" />
            {project.categories.name}
          </span>
        )}
        <h1 className="font-display mt-3 text-3xl text-ink sm:text-4xl">{project.title}</h1>
        {brand && (
          <p className="mt-3 text-sm text-ink/60">
            Posted by{" "}
            <span className="font-semibold">
              {brand.company_name || `${brand.first_name} ${brand.last_name}`}
            </span>
            {brand.city ? ` · ${brand.city}` : ""}
          </p>
        )}
        <p className="mt-8 whitespace-pre-wrap leading-relaxed text-ink/70">
          {project.description}
        </p>
        {project.brief_url && (
          <a
            href={project.brief_url}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-xs font-semibold uppercase tracking-wide text-brand hover:border-brand"
          >
            <FileText className="h-3.5 w-3.5" />
            View creative brief
          </a>
        )}
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="overflow-hidden rounded-2xl border border-line shadow-sm">
          <div className="bg-grad-brand px-6 py-5">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-paper/70">
              <Wallet className="h-3.5 w-3.5" />
              {project.pricing_type === "fixed" ? "Fixed Price" : "Hourly Rate"}
            </p>
            <p className="font-display mt-1.5 text-2xl text-paper">
              Ksh {project.budget_min.toLocaleString()} – {project.budget_max.toLocaleString()}
            </p>
          </div>

          <div className="p-6">
            {error && (
              <p className="mb-4 rounded-lg border border-magenta/40 bg-magenta/10 px-4 py-3 text-sm text-magenta">
                {error}
              </p>
            )}
            {sent && (
              <p className="mb-4 rounded-lg border border-green/40 bg-green/10 px-4 py-3 text-sm text-green">
                Proposal sent.
              </p>
            )}

            {profile?.role === "creative" ? (
              myProposal ? (
                <p className="text-sm text-ink/60">
                  You already sent a proposal — status:{" "}
                  <span className="font-semibold uppercase text-brand">{myProposal.status}</span>
                </p>
              ) : (
                <form action={submit} className="space-y-4">
                  <input type="hidden" name="project_id" value={project.id} />
                  <label className="block">
                    <span className="text-xs font-semibold text-ink/60">Your rate (KES)</span>
                    <input
                      name="rate"
                      type="number"
                      min={0}
                      required
                      className="mt-1.5 w-full rounded-lg border border-line bg-transparent px-4 py-2.5 text-ink outline-none focus:border-brand"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-ink/60">Message</span>
                    <textarea
                      name="message"
                      rows={4}
                      className="mt-1.5 w-full rounded-lg border border-line bg-transparent px-4 py-3 text-ink outline-none focus:border-brand"
                    />
                  </label>
                  <button
                    type="submit"
                    className="w-full rounded-full bg-grad-brand px-5 py-3 text-sm font-semibold uppercase tracking-wide text-paper shadow-sm transition hover:opacity-90"
                  >
                    Send Proposal
                  </button>
                </form>
              )
            ) : (
              <p className="text-sm text-ink/40">
                Sign in as a creative to send a proposal.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
