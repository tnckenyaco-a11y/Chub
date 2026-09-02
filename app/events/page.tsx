import Link from "next/link";
import type { Metadata } from "next";
import { CalendarDays, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ComingSoon } from "@/components/coming-soon";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Events & Workshops",
  description: "Upcoming events and workshops for African creatives and the brands who hire them.",
  openGraph: {
    title: "Events & Workshops",
    description: "Upcoming events and workshops for African creatives and the brands who hire them.",
  },
};

export default async function EventsPage() {
  const supabase = await createClient();
  const nowIso = new Date().toISOString();

  const [{ data: upcoming }, { data: past }] = await Promise.all([
    supabase
      .from("events")
      .select("slug, title, event_type, location, starts_at, excerpt, cover_image_url")
      .eq("status", "published")
      .gte("starts_at", nowIso)
      .order("starts_at", { ascending: true }),
    supabase
      .from("events")
      .select("slug, title, event_type, location, starts_at, excerpt, cover_image_url")
      .eq("status", "published")
      .lt("starts_at", nowIso)
      .order("starts_at", { ascending: false })
      .limit(6),
  ]);

  if (!upcoming?.length && !past?.length) {
    return <ComingSoon title="Events & Workshops" note="Nothing scheduled yet — check back soon." />;
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 lg:px-10">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-volt">Get Involved</p>
        <h1 className="font-display mt-2 text-4xl text-ink">
          Events &amp; <span className="font-accent">workshops</span>
        </h1>
      </div>

      {upcoming?.length ? (
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {upcoming.map((event) => (
            <EventCard key={event.slug} event={event} />
          ))}
        </div>
      ) : (
        <p className="mt-12 text-center text-sm text-ink/50">Nothing upcoming right now — check back soon.</p>
      )}

      {past?.length ? (
        <div className="mt-20">
          <h2 className="font-display text-2xl text-ink">Past events</h2>
          <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {past.map((event) => (
              <EventCard key={event.slug} event={event} muted />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function EventCard({
  event,
  muted,
}: {
  event: {
    slug: string;
    title: string;
    event_type: string;
    location: string | null;
    starts_at: string;
    excerpt: string | null;
    cover_image_url: string | null;
  };
  muted?: boolean;
}) {
  return (
    <Link href={`/events/${event.slug}`} className={`group block ${muted ? "opacity-60" : ""}`}>
      <div
        className="aspect-4/3 rounded-2xl bg-cover bg-center bg-grad-brand transition group-hover:shadow-lg"
        style={
          event.cover_image_url ? { backgroundImage: `url(${event.cover_image_url})` } : undefined
        }
      />
      <span className="mt-4 inline-block rounded-full bg-brand/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-brand">
        {event.event_type}
      </span>
      <h2 className="font-display mt-2 text-lg text-ink transition group-hover:text-brand">
        {event.title}
      </h2>
      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-ink/50">
        <CalendarDays className="h-3.5 w-3.5" />
        {formatDate(event.starts_at)}
      </p>
      {event.location && (
        <p className="mt-1 flex items-center gap-1.5 text-xs text-ink/50">
          <MapPin className="h-3.5 w-3.5" />
          {event.location}
        </p>
      )}
      {event.excerpt && (
        <p className="mt-2 line-clamp-2 text-sm text-ink/55">{event.excerpt}</p>
      )}
    </Link>
  );
}
