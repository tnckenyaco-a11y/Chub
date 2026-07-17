import Image from "next/image";

export function ListingHero({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <section className="relative overflow-hidden bg-brand">
      <Image
        src="/logo-icon-white.png"
        alt=""
        width={400}
        height={280}
        className="pointer-events-none absolute -right-8 -top-12 h-56 w-auto opacity-10 sm:h-72"
      />
      <div className="relative mx-auto max-w-7xl px-6 py-14 lg:px-10 lg:py-18">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-volt">{eyebrow}</p>
        <h1 className="font-display mt-3 text-5xl uppercase text-paper sm:text-6xl">{title}</h1>
        <p className="mt-3 max-w-lg text-sm text-paper/70">{subtitle}</p>
      </div>
    </section>
  );
}
