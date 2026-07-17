import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/current-user";
import { startConversation } from "@/app/messages/actions";

export default async function CreativeProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("public_profiles")
    .select("id, first_name, last_name, username, bio, city, country, role")
    .eq("username", username)
    .maybeSingle();

  if (!profile?.id || profile.role !== "creative") notFound();
  const creativeId = profile.id;

  const viewer = await getCurrentProfile();
  const messageAction = viewer && viewer.id !== creativeId
    ? startConversation.bind(null, creativeId)
    : null;

  const [{ data: services }, { data: reviews }] = await Promise.all([
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
  ]);

  const avgRating =
    reviews && reviews.length
      ? (reviews.reduce((sum, r) => sum + r.overall_rating, 0) / reviews.length).toFixed(1)
      : null;

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 lg:px-10">
      <div className="flex items-start gap-6">
        <div className="h-20 w-20 shrink-0 rounded-full bg-paper/10" />
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
          {messageAction && (
            <form action={messageAction} className="mt-4">
              <button
                type="submit"
                className="rounded-full border border-line px-5 py-2 text-xs font-semibold uppercase tracking-wide text-paper hover:border-volt hover:text-volt"
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>

      {profile.bio && <p className="mt-8 max-w-2xl text-paper/70">{profile.bio}</p>}

      <section className="mt-14">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-paper/50">Services</h2>
        {services?.length ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {services.map((s) => (
              <div key={s.id} className="rounded-2xl border border-line p-5">
                <p className="font-semibold text-paper">{s.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-paper/60">{s.description}</p>
              </div>
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
  );
}
