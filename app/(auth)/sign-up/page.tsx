import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Sparkles, Wallet } from "lucide-react";
import { signUp } from "@/app/(auth)/actions";
import { getBranding } from "@/lib/branding";

const perks = [
  { icon: ShieldCheck, text: "Every creative profile is manually vetted before it goes live" },
  { icon: Wallet, text: "Payments move through secure M-Pesa escrow — no chasing invoices" },
  { icon: Sparkles, text: "Free to join. We only take a small fee on completed orders" },
];

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; error?: string }>;
}) {
  const [params, branding] = await Promise.all([searchParams, getBranding()]);
  const role = params.role === "creative" ? "creative" : "brand";

  return (
    <div className="grid min-h-[calc(100vh-73px)] lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-ink lg:block">
        <Image
          src="/hero/designer-desk.png"
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
          <div className="space-y-5">
            <p className="font-accent max-w-md text-3xl leading-snug text-paper">
              Join the marketplace built for Africa&apos;s creative economy
            </p>
            <ul className="space-y-3">
              {perks.map((perk) => (
                <li key={perk.text} className="flex items-start gap-3 text-sm text-paper/75">
                  <perk.icon className="mt-0.5 h-4 w-4 shrink-0 text-volt" />
                  {perk.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center px-6 py-16 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <h1 className="font-display text-3xl text-ink">Sign Up</h1>
          <p className="mt-2 text-sm text-ink/60">
            Already have an account?{" "}
            <Link href="/sign-in" className="font-semibold text-brand hover:underline">
              Sign in
            </Link>
          </p>

          {params.error && (
            <p className="mt-6 rounded-lg border border-magenta/40 bg-magenta/10 px-4 py-3 text-sm text-magenta">
              {params.error}
            </p>
          )}

          <form action={signUp} className="mt-8 space-y-5">
            <fieldset className="flex gap-2 rounded-full border border-line p-1">
              <legend className="sr-only">Account type</legend>
              {(["creative", "brand"] as const).map((value) => (
                <label
                  key={value}
                  className="flex-1 cursor-pointer rounded-full px-4 py-2 text-center text-sm font-semibold uppercase tracking-wide transition has-[:checked]:bg-grad-brand has-[:checked]:text-paper has-[:checked]:shadow-sm"
                >
                  <input
                    type="radio"
                    name="role"
                    value={value}
                    defaultChecked={role === value}
                    className="sr-only"
                  />
                  {value === "creative" ? "Creative" : "Brand"}
                </label>
              ))}
            </fieldset>

            <div className="grid grid-cols-2 gap-4">
              <Field label="First name" name="first_name" required />
              <Field label="Last name" name="last_name" required />
            </div>
            <Field label="Username" name="username" required />
            <Field label="Email" name="email" type="email" required />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Phone" name="phone" type="tel" />
              <Field label="City" name="city" defaultValue="Nairobi" />
            </div>
            <Field label="Country" name="country" defaultValue="Kenya" />
            <Field label="Password" name="password" type="password" required />
            <Field label="Confirm password" name="confirm_password" type="password" required />

            <button
              type="submit"
              className="w-full rounded-full bg-grad-brand px-6 py-3.5 text-sm font-semibold uppercase tracking-wide text-paper shadow-sm transition hover:opacity-90"
            >
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">
        {label}
        {required ? " *" : ""}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="mt-1.5 w-full rounded-lg border border-line bg-transparent px-4 py-2.5 text-ink outline-none focus:border-brand"
      />
    </label>
  );
}
