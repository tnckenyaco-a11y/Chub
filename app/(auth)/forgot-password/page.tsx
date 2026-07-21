import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, KeyRound } from "lucide-react";
import { requestPasswordReset } from "@/app/(auth)/actions";
import { getBranding } from "@/lib/branding";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [params, branding] = await Promise.all([searchParams, getBranding()]);

  return (
    <div className="grid min-h-[calc(100vh-73px)] lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-ink lg:block">
        <Image src="/hero/music-studio.png" alt="" fill className="object-cover opacity-40" />
        <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/40 to-ink/10" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Image
            src={branding.logo_light_url || "/logo-lockup-white.png"}
            alt="Creators Hub"
            width={2782}
            height={708}
            className="h-8 w-auto self-start"
            unoptimized={Boolean(branding.logo_light_url)}
          />
          <p className="font-accent max-w-md text-3xl leading-snug text-paper">
            Locked out happens to the best of us
          </p>
        </div>
      </div>

      <div className="flex flex-col justify-center px-6 py-16 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/sign-in" className="mb-8 flex items-center gap-2 text-sm font-semibold text-ink/50 hover:text-ink">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to sign in
          </Link>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
            <KeyRound className="h-5 w-5" />
          </div>

          <h1 className="font-display mt-5 text-3xl text-ink">Forgot your password?</h1>
          <p className="mt-2 text-sm text-ink/60">
            Enter the email on your account and we&apos;ll send you a reset link.
          </p>

          {params.error && (
            <p className="mt-6 rounded-lg border border-magenta/40 bg-magenta/10 px-4 py-3 text-sm text-magenta">
              {params.error}
            </p>
          )}

          <form action={requestPasswordReset} className="mt-8 space-y-5">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">
                Email
              </span>
              <input
                name="email"
                type="email"
                required
                className="mt-1.5 w-full rounded-lg border border-line bg-transparent px-4 py-2.5 text-ink outline-none focus:border-brand"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-full bg-grad-brand px-6 py-3.5 text-sm font-semibold uppercase tracking-wide text-paper shadow-sm transition hover:opacity-90"
            >
              Send Reset Link
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
