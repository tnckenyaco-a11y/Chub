import Link from "next/link";
import { CheckCircle2, Circle, X } from "lucide-react";
import { dismissOnboarding } from "@/app/dashboard/actions";

export type OnboardingStep = {
  label: string;
  description: string;
  done: boolean;
  href: string;
  cta: string;
};

export function OnboardingChecklist({ steps }: { steps: OnboardingStep[] }) {
  const doneCount = steps.filter((s) => s.done).length;
  const allDone = doneCount === steps.length;

  if (allDone) return null;

  return (
    <div className="relative mb-8 overflow-hidden rounded-2xl border border-line bg-paper p-6 shadow-sm">
      <form action={dismissOnboarding} className="absolute right-4 top-4">
        <button
          type="submit"
          aria-label="Dismiss getting-started checklist"
          className="text-ink/30 hover:text-ink/60"
        >
          <X className="h-4 w-4" />
        </button>
      </form>

      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Get started</p>
      <h2 className="font-display mt-2 text-xl text-ink">
        You&apos;re {doneCount} of {steps.length} steps away from a complete profile
      </h2>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-bg">
        <div
          className="h-full rounded-full bg-grad-brand transition-all"
          style={{ width: `${(doneCount / steps.length) * 100}%` }}
        />
      </div>

      <ul className="mt-6 space-y-3">
        {steps.map((step) => (
          <li
            key={step.label}
            className={`flex items-center gap-3.5 rounded-xl border p-3.5 ${
              step.done ? "border-line/60 bg-bg/40" : "border-line"
            }`}
          >
            {step.done ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-green" />
            ) : (
              <Circle className="h-5 w-5 shrink-0 text-ink/25" />
            )}
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-semibold ${step.done ? "text-ink/50 line-through" : "text-ink"}`}>
                {step.label}
              </p>
              <p className="mt-0.5 text-xs text-ink/45">{step.description}</p>
            </div>
            {!step.done && (
              <Link
                href={step.href}
                className="shrink-0 rounded-full border border-line px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-ink transition hover:border-brand hover:text-brand"
              >
                {step.cta}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
