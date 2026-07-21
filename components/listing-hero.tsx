import { Search } from "lucide-react";

export function ListingHero({
  eyebrow,
  title,
  subtitle,
  searchAction,
  searchParamName = "q",
  searchDefaultValue,
  searchPlaceholder = "Search...",
  preserveParams,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  searchAction?: string;
  searchParamName?: string;
  searchDefaultValue?: string;
  searchPlaceholder?: string;
  preserveParams?: Record<string, string | undefined>;
}) {
  return (
    <section className="bg-grad-brand">
      <div className="mx-auto max-w-7xl px-6 py-10 text-center lg:px-10 lg:py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-volt">{eyebrow}</p>
        <h1 className="font-display mt-2 text-3xl text-paper sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-paper/65">{subtitle}</p>

        {searchAction && (
          <form action={searchAction} className="mx-auto mt-6 flex max-w-xl items-center gap-3 rounded-2xl bg-paper px-5 py-3.5 shadow-lg">
            {preserveParams &&
              Object.entries(preserveParams).map(
                ([key, value]) =>
                  value && <input key={key} type="hidden" name={key} value={value} />
              )}
            <Search className="h-[18px] w-[18px] shrink-0 text-brand" />
            <input
              type="text"
              name={searchParamName}
              defaultValue={searchDefaultValue}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-sm text-ink placeholder:text-ink/40 focus:outline-none"
            />
          </form>
        )}
      </div>
    </section>
  );
}
