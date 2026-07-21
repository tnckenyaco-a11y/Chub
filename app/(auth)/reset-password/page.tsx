import Image from "next/image";
import { Lock } from "lucide-react";
import { updatePassword } from "@/app/(auth)/actions";
import { getBranding } from "@/lib/branding";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [params, branding] = await Promise.all([searchParams, getBranding()]);

  return (
    <div className="grid min-h-[calc(100vh-73px)] lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-ink lg:block">
        <Image src="/hero/designer-desk.png" alt="" fill className="object-cover opacity-40" />
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
            Almost there — one last step
          </p>
        </div>
      </div>

      <div className="flex flex-col justify-center px-6 py-16 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green/10 text-green">
            <Lock className="h-5 w-5" />
          </div>

          <h1 className="font-display mt-5 text-3xl text-ink">Set a new password</h1>
          <p className="mt-2 text-sm text-ink/60">
            Your new password must be different from previously used passwords.
          </p>

          {params.error && (
            <p className="mt-6 rounded-lg border border-magenta/40 bg-magenta/10 px-4 py-3 text-sm text-magenta">
              {params.error}
            </p>
          )}

          <form action={updatePassword} className="mt-8 space-y-5">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">
                New Password
              </span>
              <input
                name="password"
                type="password"
                required
                minLength={8}
                className="mt-1.5 w-full rounded-lg border border-line bg-transparent px-4 py-2.5 text-ink outline-none focus:border-brand"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">
                Confirm Password
              </span>
              <input
                name="confirm_password"
                type="password"
                required
                minLength={8}
                className="mt-1.5 w-full rounded-lg border border-line bg-transparent px-4 py-2.5 text-ink outline-none focus:border-brand"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-full bg-grad-brand px-6 py-3.5 text-sm font-semibold uppercase tracking-wide text-paper shadow-sm transition hover:opacity-90"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
