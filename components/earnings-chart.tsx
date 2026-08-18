import { TrendingUp } from "lucide-react";

export type MonthlyPoint = { label: string; value: number };

export function EarningsChart({
  title,
  emptyLabel,
  data,
}: {
  title: string;
  emptyLabel: string;
  data: MonthlyPoint[];
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="rounded-2xl border border-line bg-paper p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            Last 6 months
          </p>
          <h2 className="font-display mt-2 text-xl text-ink">{title}</h2>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-grad-brand">
          <TrendingUp className="h-4.5 w-4.5 text-paper" />
        </span>
      </div>

      {total > 0 ? (
        <>
          <p className="font-display mt-4 text-3xl text-ink">Ksh {total.toLocaleString()}</p>

          <div className="mt-6 flex h-32 items-end gap-2.5 border-b border-line sm:gap-4">
            {data.map((d) => (
              <div key={d.label} className="group relative flex flex-1 flex-col items-center">
                <div
                  className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[10px] font-semibold text-paper opacity-0 shadow-lg transition group-hover:opacity-100"
                  role="tooltip"
                >
                  Ksh {d.value.toLocaleString()}
                </div>
                <div className="flex h-28 w-full max-w-6 items-end justify-center">
                  <div
                    className={`w-full rounded-t-[4px] transition ${
                      d.value > 0 ? "bg-grad-brand" : "bg-line"
                    }`}
                    style={{ height: d.value > 0 ? `${Math.max((d.value / max) * 100, 4)}%` : "2px" }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-2.5 sm:gap-4">
            {data.map((d) => (
              <p
                key={d.label}
                className="flex-1 text-center text-[10px] font-semibold uppercase tracking-wide text-ink/40"
              >
                {d.label}
              </p>
            ))}
          </div>
        </>
      ) : (
        <p className="mt-6 text-sm text-ink/40">{emptyLabel}</p>
      )}
    </div>
  );
}
