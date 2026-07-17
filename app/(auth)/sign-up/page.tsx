import Link from "next/link";
import { signUp } from "@/app/(auth)/actions";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; error?: string }>;
}) {
  const params = await searchParams;
  const role = params.role === "creative" ? "creative" : "brand";

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-6 py-16">
      <h1 className="font-display text-4xl uppercase text-ink">Sign Up</h1>
      <p className="mt-2 text-sm text-ink/60">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-volt hover:underline">
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
              className="flex-1 cursor-pointer rounded-full px-4 py-2 text-center text-sm font-semibold uppercase tracking-wide has-[:checked]:bg-volt has-[:checked]:text-ink"
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
          className="w-full rounded-full bg-volt px-6 py-3.5 text-sm font-semibold uppercase tracking-wide text-ink transition hover:bg-ink hover:text-paper"
        >
          Sign Up
        </button>
      </form>
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
        className="mt-1.5 w-full rounded-lg border border-line bg-transparent px-4 py-2.5 text-ink outline-none focus:border-volt"
      />
    </label>
  );
}
