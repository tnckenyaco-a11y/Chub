import Link from "next/link";
import { signIn } from "@/app/(auth)/actions";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-6 py-16">
      <h1 className="font-display text-4xl uppercase text-paper">Sign In</h1>
      <p className="mt-2 text-sm text-paper/60">
        New here?{" "}
        <Link href="/sign-up" className="text-volt hover:underline">
          Create an account
        </Link>
      </p>

      {params.error && (
        <p className="mt-6 rounded-lg border border-magenta/40 bg-magenta/10 px-4 py-3 text-sm text-magenta">
          {params.error}
        </p>
      )}

      <form action={signIn} className="mt-8 space-y-5">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-paper/50">
            Email
          </span>
          <input
            name="email"
            type="email"
            required
            className="mt-1.5 w-full rounded-lg border border-line bg-transparent px-4 py-2.5 text-paper outline-none focus:border-volt"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-paper/50">
            Password
          </span>
          <input
            name="password"
            type="password"
            required
            className="mt-1.5 w-full rounded-lg border border-line bg-transparent px-4 py-2.5 text-paper outline-none focus:border-volt"
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-full bg-volt px-6 py-3.5 text-sm font-semibold uppercase tracking-wide text-ink transition hover:bg-paper"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}
