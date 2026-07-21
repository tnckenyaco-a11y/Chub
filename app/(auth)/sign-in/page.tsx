import Image from "next/image";
import Link from "next/link";
import { signIn } from "@/app/(auth)/actions";
import { getBranding } from "@/lib/branding";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; reset?: string }>;
}) {
  const [params, branding] = await Promise.all([searchParams, getBranding()]);

  return (
    <div className="grid min-h-[calc(100vh-73px)] lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-ink lg:block">
        <Image
          src="/hero/videographer-set.png"
          alt=""
          fill
          className="object-cover opacity-40"
        />
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
          <div>
            <p className="font-accent max-w-md text-3xl leading-snug text-paper">
              &ldquo;The escrow system means I never worry about getting paid. I just focus on the
              work.&rdquo;
            </p>
            <p className="mt-4 text-sm text-paper/60">— Amara O., Graphic Designer</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center px-6 py-16 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <h1 className="font-display text-3xl text-ink">Sign In</h1>
          <p className="mt-2 text-sm text-ink/60">
            New here?{" "}
            <Link href="/sign-up" className="font-semibold text-brand hover:underline">
              Create an account
            </Link>
          </p>

          {params.reset && (
            <p className="mt-6 rounded-lg border border-green/40 bg-green/10 px-4 py-3 text-sm text-green">
              Password updated. Sign in with your new password.
            </p>
          )}
          {params.error && (
            <p className="mt-6 rounded-lg border border-magenta/40 bg-magenta/10 px-4 py-3 text-sm text-magenta">
              {params.error}
            </p>
          )}

          <form action={signIn} className="mt-8 space-y-5">
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
            <label className="block">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">
                  Password
                </span>
                <Link href="/forgot-password" className="text-xs font-semibold text-brand hover:underline">
                  Forgot password?
                </Link>
              </div>
              <input
                name="password"
                type="password"
                required
                className="mt-1.5 w-full rounded-lg border border-line bg-transparent px-4 py-2.5 text-ink outline-none focus:border-brand"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-full bg-grad-brand px-6 py-3.5 text-sm font-semibold uppercase tracking-wide text-paper shadow-sm transition hover:opacity-90"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
