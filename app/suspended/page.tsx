import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account Suspended",
};

export default function SuspendedPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-magenta">
        Account Suspended
      </p>
      <h1 className="font-display mt-3 text-3xl text-ink">
        This account has been suspended
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-ink/60">
        If you believe this is a mistake,{" "}
        <Link href="/contact" className="font-semibold text-brand hover:underline">
          contact our support team
        </Link>{" "}
        and we&apos;ll help sort it out.
      </p>
    </div>
  );
}
