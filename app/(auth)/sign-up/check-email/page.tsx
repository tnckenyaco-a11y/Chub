import { MailCheck } from "lucide-react";

export default function CheckEmailPage() {
  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
        <MailCheck className="h-6 w-6" />
      </div>
      <h1 className="font-display mt-5 text-3xl text-ink">Check Your Email</h1>
      <p className="mt-3 text-sm text-ink/60">
        We&apos;ve sent a confirmation link to your inbox. Click it to activate your
        account, then sign in.
      </p>
    </div>
  );
}
