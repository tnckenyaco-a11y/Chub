"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  pendingText,
  className,
  confirmMessage,
}: {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
  // When set, asks for confirmation before the form submits — for
  // destructive actions (delete, etc).
  confirmMessage?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (confirmMessage && !window.confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
      className={`inline-flex items-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-60 ${className ?? ""}`}
    >
      {pending && (
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {pending && pendingText ? pendingText : children}
    </button>
  );
}
