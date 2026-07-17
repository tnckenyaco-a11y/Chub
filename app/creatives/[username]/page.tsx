import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/current-user";
import { startConversation } from "@/app/messages/actions";

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

  const [{ data: services }, { data: reviews }, { data: portfolio }] = await Promise.all([
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
  ]);

  const avgRating =
    reviews && reviews.length
      ? (reviews.reduce((sum, r) => sum + r.overall_rating, 0) / reviews.length).toFixed(1)
      : null;

  const socialLinks = Object.entries((profile.social_links as Record<string, string>) ?? {}).filter(
    ([, url]) => Boolean(url)
  );

  return (
    <div>
      {profile.cover_url && (
        <div
          className="h-40 w-full bg-cover bg-center sm:h-56"
          style={{ backgroundImage: `url(${profile.cover_url})` }}
        />
      )}

      <div className="mx-auto max-w-4xl px-6 py-16 lg:px-10">
        <div className="flex items-start gap-6">
          <div
            className="h-20 w-20 shrink-0 rounded-full bg-paper/10 bg-cover bg-center"
            style={profile.avatar_url ? { backgroundImage: `url(${profile.avatar_url})` } : undefined}
          />
          <div>
            <h1 className="font-display text-4xl uppercase text-paper">
              {profile.first_name} {profile.last_name}
            </h1>
            <p className="mt-1 text-sm text-paper/50">
              @{profile.username}
              {(profile.city || profile.country) &&
                ` · ${[profile.city, profile.country].filter(Boolean).join(", ")}`}
            </p>
            {avgRating && (
              <p className="mt-1 text-sm text-volt">
                {avgRating} ★ ({reviews!.length} review{reviews!.length === 1 ? "" : "s"})
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-4">
              {messageAction && (
                <form action={messageAction}>
                  <button
                    type="submit"
                    className="rounded-full border border-line px-5 py-2 text-xs font-semibold uppercase tracking-wide text-paper hover:border-volt hover:text-volt"
                  >
                    Send Message
                  </button>
                </form>
              )}
              {profile.website_url && (
                <a
                  href={profile.website_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs uppercase tracking-wide text-paper/60 hover:text-volt"
                >
                  Website ↗
                </a>
              )}
              {socialLinks.map(([key, url]) => (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs uppercase tracking-wide text-paper/60 hover:text-volt"
                >
                  {SOCIAL_LABELS[key] ?? key} ↗
                </a>
              ))}
            </div>
          </div>
        </div>

        {profile.bio && <p className="mt-8 max-w-2xl text-paper/70">{profile.bio}</p>}

        {portfolio && portfolio.length > 0 && (
          <section className="mt-14">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-paper/50">
              Portfolio
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {portfolio.map((item) => {
                const Wrapper = item.link_url ? "a" : "div";
                return (
                  <Wrapper
                    key={item.id}
                    {...(item.link_url
                      ? { href: item.link_url, target: "_blank", rel: "noreferrer" }
                      : {})}
                    className="block overflow-hidden rounded-xl border border-line"
                  >
                    {item.file_type === "pdf" ? (
                      <div className="flex h-36 items-center justify-center bg-paper/5 text-xs uppercase text-paper/60">
                        PDF Document
                      </div>
                    ) : (
                      <div
                        className="h-36 bg-cover bg-center"
                        style={{ backgroundImage: `url(${item.file_url})` }}
                      />
                    )}
                    {item.title && (
                      <p className="p-2 truncate text-xs text-paper/70">{item.title}</p>
                    )}
                  </Wrapper>
                );
              })}
            </div>
          </section>
        )}

        <section className="mt-14">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-paper/50">Services</h2>
          {services?.length ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {services.map((s) => (
                <Link
                  key={s.id}
                  href={`/services/${s.slug}`}
                  className="rounded-2xl border border-line p-5 transition hover:border-volt"
                >
                  <p className="font-semibold text-paper">{s.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-paper/60">{s.description}</p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-paper/40">No published services yet.</p>
          )}
        </section>

        <section className="mt-14">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-paper/50">Reviews</h2>
          {reviews?.length ? (
            <div className="mt-4 space-y-4">
              {reviews.map((r, i) => (
                <div key={i} className="rounded-2xl border border-line p-5">
                  <p className="text-sm text-volt">{r.overall_rating} ★</p>
                  {r.comment && <p className="mt-2 text-sm text-paper/70">{r.comment}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-paper/40">No reviews yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}
