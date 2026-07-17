export function ComingSoon({ title, note }: { title: string; note?: string }) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 py-24 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-volt">In Progress</p>
      <h1 className="font-display mt-4 text-5xl uppercase text-paper">{title}</h1>
      {note && <p className="mt-4 text-sm text-paper/60">{note}</p>}
    </div>
  );
}
