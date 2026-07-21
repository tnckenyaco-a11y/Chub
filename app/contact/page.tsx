import Link from "next/link";
import { CheckCircle2, Clock, HelpCircle } from "lucide-react";
import { getSitePage } from "@/lib/site-pages";
import { submitContactMessage } from "@/app/contact/actions";

type ContactContent = {
  intro?: string;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const { sent, error } = await searchParams;
  const page = await getSitePage<ContactContent>("contact");
  const content = page?.content ?? {};
  const hasDetails = Boolean(content.email || content.phone || content.location);

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 lg:px-10">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-volt">Get In Touch</p>
        <h1 className="font-display mt-2 text-4xl text-ink">
          We&apos;d love to <span className="font-accent">hear from you</span>
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-ink/60">
          {content.intro ??
            "Questions about the platform, a partnership idea, or need help with an order? Reach out — a real person reads every message."}
        </p>
      </div>

      <div className="mt-14 grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-4">
          {hasDetails && (
            <>
              {content.email && (
                <ContactCard title="Email us" value={content.email} href={`mailto:${content.email}`} />
              )}
              {content.phone && (
                <ContactCard title="Call us" value={content.phone} href={`tel:${content.phone}`} />
              )}
              {content.location && <ContactCard title="Find us" value={content.location} />}
            </>
          )}

          <div className="rounded-2xl border border-line bg-paper p-6 shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <Clock className="h-4 w-4" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-ink">Response time</h3>
            <p className="mt-1 text-sm text-ink/55">We read every message and get back to you as soon as we can.</p>
          </div>

          <Link
            href="/faq"
            className="flex items-center gap-4 rounded-2xl border border-line bg-paper p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-brand hover:shadow-md"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <HelpCircle className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink">Got a quick question?</h3>
              <p className="mt-1 text-sm text-ink/55">Check the FAQ first — most answers are already there.</p>
            </div>
          </Link>
        </div>

        <div className="rounded-3xl bg-bg p-8 sm:p-10">
          <h2 className="font-display text-2xl text-ink">Send us a message</h2>
          <p className="mt-1 text-sm text-ink/55">Fill out the form and we&apos;ll get back to you shortly.</p>

          {sent && (
            <p className="mt-6 flex items-center gap-2 rounded-lg border border-green/40 bg-green/10 px-4 py-3 text-sm text-green">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Message sent — thank you. We&apos;ll be in touch soon.
            </p>
          )}
          {error && (
            <p className="mt-6 rounded-lg border border-magenta/40 bg-magenta/10 px-4 py-3 text-sm text-magenta">
              {error}
            </p>
          )}

          <form action={submitContactMessage} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-ink/60">Name</span>
                <input
                  name="name"
                  required
                  placeholder="Jane Wanjiru"
                  className="mt-1.5 w-full rounded-lg border border-line bg-paper px-4 py-2.5 text-sm text-ink outline-none focus:border-brand"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-ink/60">Email</span>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="jane@email.com"
                  className="mt-1.5 w-full rounded-lg border border-line bg-paper px-4 py-2.5 text-sm text-ink outline-none focus:border-brand"
                />
              </label>
            </div>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink/60">I am a...</span>
              <select
                name="inquiry_type"
                defaultValue="brand"
                className="mt-1.5 w-full rounded-lg border border-line bg-paper px-4 py-2.5 text-sm text-ink outline-none focus:border-brand"
              >
                <option value="brand">Brand looking to hire</option>
                <option value="creative">Creative looking for work</option>
                <option value="press">Press / Partnership</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink/60">Message</span>
              <textarea
                name="message"
                required
                rows={5}
                placeholder="How can we help?"
                className="mt-1.5 w-full rounded-lg border border-line bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-brand"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-full bg-grad-brand px-6 py-3.5 text-sm font-semibold uppercase tracking-wide text-paper shadow-sm transition hover:opacity-90"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function ContactCard({ title, value, href }: { title: string; value: string; href?: string }) {
  const Wrapper = href ? "a" : "div";
  return (
    <Wrapper
      {...(href ? { href } : {})}
      className="block rounded-2xl border border-line bg-paper p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <p className="mt-1 text-sm font-medium text-brand">{value}</p>
    </Wrapper>
  );
}
