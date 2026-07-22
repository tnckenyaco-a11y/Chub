import Link from "next/link";
import { notFound } from "next/navigation";
import { Globe, MapPin, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/current-user";
import { startConversation } from "@/app/messages/actions";
import { inviteCreativeToProject } from "@/app/dashboard/projects/actions";
import { ProfileTabs } from "@/components/profile-tabs";

const SOCIAL_LABELS: Record<string, string> = {
  instagram: "Instagram",
  twitter: "Twitter / X",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
  youtube: "YouTube",
};

export default async function CreativeProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("public_profiles")
    .select(
      "id, first_name, last_name, username, bio, city, country, role, avatar_url, cover_url, social_links, website_url"
    )
    .eq("username", username)
    .maybeSingle();

  if (!profile?.id || profile.role !== "creative") notFound();
  const creativeId = profile.id;

  const viewer = await getCurrentProfile();
  const messageAction = viewer && viewer.id !== creativeId
    ? startConversation.bind(null, creativeId)
    : null;
  const invite = viewer?.role === "brand" ? inviteCreativeToProject.bind(null, creativeId) : null;

  const [{ data: services }, { data: reviews }, { data: portfolio }, { data: brandProjects }] =
    await Promise.all([
    supabase
      .from("services")
      .select("id, title, slug, description")
      .eq("creative_id", creativeId)
      .eq("status", "published"),
    supabase
      .from("reviews")
      .select("overall_rating, comment, created_at")
      .eq("reviewee_id", creativeId)
      .order("created_at", { ascending: false }),
    supabase
      .from("portfolio_items")
      .select("id, title, file_url, file_type, link_url")
      .eq("profile_id", creativeId)
      .order("sort_order"),
    viewer?.role === "brand"
      ? supabase.from("projects").select("id, title").eq("brand_id", viewer.id).order("created_at", { ascending: false })
      : Promise.resolve({ data: null }),
  ]);

  const avgRating =
    reviews && reviews.length
      ? (reviews.reduce((sum, r) => sum + r.overall_rating, 0) / reviews.length).toFixed(1)
      : null;

  const socialLinks = Object.entries((profile.social_links as Record<string, string>) ?? {}).filter(
    ([, url]) => Boolean(url)
  );
  const initials = `${profile.first_name?.[0] ?? ""}${profile.last_name?.[0] ?? ""}`.toUpperCase();

  const aboutContent = (
    <div className="max-w-2xl space-y-6">
      {profile.bio ? (
        <p className="leading-relaxed text-ink/70">{profile.bio}</p>
      ) : (
        <p className="text-sm text-ink/40">This creative hasn&apos;t written a bio yet.</p>
      )}
      {socialLinks.length > 0 && (
        <div className="flex flex-wrap gap-4 border-t border-line pt-6">
          {socialLinks.map(([key, url]) => (
            <a
              key={key}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold uppercase tracking-wide text-ink/60 hover:text-brand"
            >
              {SOCIAL_LABELS[key] ?? key} ↗
            </a>
          ))}
        </div>
      )}
    </div>
  );

  const portfolioContent =
    portfolio && portfolio.length > 0 ? (
      <div className="grid gap-4 sm:grid-cols-3">
        {portfolio.map((item) => {
          const Wrapper = item.link_url ? "a" : "div";
          return (
            <Wrapper
              key={item.id}
              {...(item.link_url
                ? { href: item.link_url, target: "_blank", rel: "noreferrer" }
                : {})}
              className="group block overflow-hidden rounded-xl border border-line transition hover:shadow-md"
            >
              {item.file_type === "pdf" ? (
                <div className="flex h-36 items-center justify-center bg-bg text-xs uppercase text-ink/60">
                  PDF Document
                </div>
              ) : (
                <div
                  className="h-36 bg-cover bg-center transition group-hover:scale-[1.02]"
                  style={{ backgroundImage: `url(${item.file_url})` }}
                />
              )}
              {item.title && (
                <p className="truncate p-2 text-xs text-ink/70">{item.title}</p>
              )}
            </Wrapper>
          );
        })}
      </div>
    ) : (
      <p className="text-sm text-ink/40">No portfolio pieces added yet.</p>
    );

  const servicesContent = services?.length ? (
    <div className="grid gap-4 sm:grid-cols-2">
      {services.map((s) => (
        <Link
          key={s.id}
          href={`/services/${s.slug}`}
          className="rounded-2xl border border-line p-5 transition hover:-translate-y-0.5 hover:border-brand hover:shadow-md"
        >
          <p className="font-semibold text-ink">{s.title}</p>
          <p className="mt-1 line-clamp-2 text-sm text-ink/60">{s.description}</p>
        </Link>
      ))}
    </div>
  ) : (
    <p className="text-sm text-ink/40">No published services yet.</p>
  );

  const reviewsContent = reviews?.length ? (
    <div className="space-y-4">
      {reviews.map((r, i) => (
        <div key={i} className="rounded-2xl border border-line p-5">
          <p className="flex items-center gap-1 text-sm font-semibold text-volt">
            <Star className="h-4 w-4 fill-volt" /> {r.overall_rating}
          </p>
          {r.comment && <p className="mt-2 text-sm text-ink/70">{r.comment}</p>}
        </div>
      ))}
    </div>
  ) : (
    <p className="text-sm text-ink/40">No reviews yet.</p>
  );

  return (
    <div>
      <div
        className="h-40 w-full bg-cover bg-center sm:h-56 bg-grad-brand"
        style={profile.cover_url ? { backgroundImage: `url(${profile.cover_url})` } : undefined}
      />

      <div className="mx-auto max-w-4xl px-6 lg:px-10">
        <div className="-mt-14 flex flex-col items-start gap-6 rounded-2xl border border-line bg-paper p-6 shadow-lg sm:flex-row sm:items-end">
          {profile.avatar_url ? (
            <div
              className="h-24 w-24 shrink-0 rounded-full border-4 border-paper bg-cover bg-center shadow-sm"
              style={{ backgroundImage: `url(${profile.avatar_url})` }}
            />
          ) : (
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-4 border-paper bg-grad-volt font-display text-2xl text-ink shadow-sm">
              {initials || "?"}
            </div>
          )}
          <div className="flex-1">
            <h1 className="font-display text-2xl text-ink sm:text-3xl">
              {profile.first_name} {profile.last_name}
            </h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink/50">
              <span>@{profile.username}</span>
              {(profile.city || profile.country) && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {[profile.city, profile.country].filter(Boolean).join(", ")}
                </span>
              )}
              {avgRating && (
                <span className="flex items-center gap-1 text-volt">
                  <Star className="h-3.5 w-3.5 fill-volt" />
                  {avgRating} ({reviews!.length} review{reviews!.length === 1 ? "" : "s"})
                </span>
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {profile.website_url && (
              <a
                href={profile.website_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink/60 hover:text-brand"
              >
                <Globe className="h-3.5 w-3.5" />
                Website
              </a>
            )}
            {messageAction && (
              <form action={messageAction}>
                <button
                  type="submit"
                  className="rounded-full bg-grad-brand px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-paper shadow-sm transition hover:opacity-90"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>

        {invite && (
          <div className="mt-6 rounded-2xl border border-line bg-paper p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-ink">Invite to a Project</h2>
            {brandProjects?.length ? (
              <form action={invite} className="mt-3 flex flex-wrap items-end gap-3">
                <label className="min-w-[180px] flex-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-ink/50">
                    Project
                  </span>
                  <select
                    name="project_id"
                    required
                    defaultValue=""
                    className="mt-1.5 w-full rounded-lg border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand"
                  >
                    <option value="" disabled>
                      Select a project
                    </option>
                    {brandProjects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="min-w-[140px] flex-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-ink/50">
                    Role
                  </span>
                  <input
                    name="role"
                    required
                    placeholder="e.g. Video Editor"
                    className="mt-1.5 w-full rounded-lg border border-line bg-transparent px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand"
                  />
                </label>
                <label className="w-32">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-ink/50">
                    Rate (KES)
                  </span>
                  <input
                    name="rate_kes"
                    type="number"
                    min={0}
                    required
                    className="mt-1.5 w-full rounded-lg border border-line bg-transparent px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand"
                  />
                </label>
                <button
                  type="submit"
                  className="rounded-full bg-grad-volt px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-ink shadow-sm transition hover:opacity-90"
                >
                  Invite
                </button>
              </form>
            ) : (
              <p className="mt-2 text-sm text-ink/40">
                Post a project first, then come back here to invite {profile.first_name} onto it.
              </p>
            )}
          </div>
        )}

        <div className="py-12">
          <ProfileTabs
            about={aboutContent}
            portfolio={portfolioContent}
            services={servicesContent}
            reviews={reviewsContent}
          />
        </div>
      </div>
    </div>
  );
}
