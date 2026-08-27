"use client";

import { useState } from "react";

export function CheckoutMethodFields({ compact = false }: { compact?: boolean }) {
  const [method, setMethod] = useState<"mpesa" | "card">("mpesa");

  return (
    <>
      <div className="flex gap-2">
        {(["mpesa", "card"] as const).map((option) => (
          <label
            key={option}
            className={`flex-1 cursor-pointer rounded-lg border text-center text-xs font-semibold uppercase tracking-wide transition ${
              compact ? "px-3 py-1.5" : "px-3 py-2"
            } ${
              method === option
                ? "border-brand bg-brand/5 text-brand"
                : "border-line text-ink/50 hover:border-ink/20"
            }`}
          >
            <input
              type="radio"
              name="payment_method"
              value={option}
              checked={method === option}
              onChange={() => setMethod(option)}
              className="sr-only"
            />
            {option === "mpesa" ? "M-Pesa" : "Card"}
          </label>
        ))}
      </div>
      {method === "mpesa" && (
        <input
          name="phone_number"
          required
          placeholder="M-Pesa phone (07XXXXXXXX)"
          className={`w-full rounded-lg border border-line bg-transparent text-sm text-ink outline-none focus:border-brand ${
            compact ? "px-4 py-2" : "px-4 py-2.5"
          }`}
        />
      )}
    </>
  );
}
