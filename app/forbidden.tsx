import Link from "next/link";

export default function Forbidden() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-6 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-magenta">403</p>
      <h1 className="font-display mt-4 text-4xl uppercase text-ink">Admins Only</h1>
      <p className="mt-4 text-sm text-ink/60">
        You don&apos;t have permission to view this page.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full border border-line px-6 py-3 text-sm font-semibold uppercase tracking-wide text-ink transition hover:border-ink"
      >
        Back home
      </Link>
    </div>
  );
}
