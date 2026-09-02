import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { CalendarDays, ChevronRight, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: event } = await supabase
    .from("events")
    .select("title, excerpt, body, cover_image_url, starts_at")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!event) return {};

  const description = event.excerpt || event.body?.slice(0, 160);

  return {
    title: event.title,
    description,
    openGraph: {
      title: event.title,
      description,
      images: event.cover_image_url ? [event.cover_image_url] : undefined,
      type: "article",
    },
  };
}

function formatTimeRange(startsAt: string, endsAt: string | null) {
  const start = new Date(startsAt);
  const time = start.toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" });
  if (!endsAt) return `${formatDate(startsAt)} · ${time}`;
  const end = new Date(endsAt);
  const endTime = end.toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" });
  return `${formatDate(startsAt)} · ${time} – ${endTime}`;
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: event } = await supabase
    .from("events")
    .select("title, event_type, location, starts_at, ends_at, registration_url, body, cover_image_url")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!event) notFound();

  const isPast = new Date(event.starts_at) < new Date();

  return (
    <article className="mx-auto max-w-3xl px-6 py-16 lg:px-10">
      <div className="flex items-center gap-2 text-xs text-ink/40">
        <Link href="/events" className="hover:text-brand">Events</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="capitalize">{event.event_type}</span>
      </div>

      <div className="mt-6 text-center">
        <span className="inline-block rounded-full bg-brand/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-brand">
          {event.event_type}
        </span>
        <h1 className="font-display mt-4 text-3xl text-ink sm:text-4xl">{event.title}</h1>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-ink/60">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4" />
            {formatTimeRange(event.starts_at, event.ends_at)}
          </span>
          {event.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {event.location}
            </span>
          )}
        </div>
      </div>

      {event.cover_image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={event.cover_image_url}
          alt={event.title}
          className="mt-10 aspect-video w-full rounded-2xl object-cover"
        />
      )}

      {event.body && (
        <div className="mt-10 whitespace-pre-wrap text-[15px] leading-loose text-ink/75">
          {event.body}
        </div>
      )}

      {event.registration_url && !isPast && (
        <div className="mt-10 text-center">
          <a
            href={event.registration_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-grad-brand px-7 py-3.5 text-sm font-semibold uppercase tracking-wide text-paper shadow-sm transition hover:opacity-90"
          >
            Register
          </a>
        </div>
      )}
    </article>
  );
}
