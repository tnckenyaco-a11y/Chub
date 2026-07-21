import { Sparkles } from "lucide-react";

export function ComingSoon({ title, note }: { title: string; note?: string }) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 py-24 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-grad-brand text-paper">
        <Sparkles className="h-6 w-6" />
      </div>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-brand">In Progress</p>
      <h1 className="font-display mt-3 text-4xl text-ink sm:text-5xl">{title}</h1>
      {note && <p className="mt-4 text-sm text-ink/60">{note}</p>}
    </div>
  );
}
