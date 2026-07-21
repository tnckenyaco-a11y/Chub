"use client";

import { useState, type ReactNode } from "react";

export function SettingsTabs({
  general,
  media,
  branding,
  identity,
}: {
  general: ReactNode;
  media: ReactNode;
  branding: ReactNode;
  identity: ReactNode;
}) {
  const tabs = [
    { id: "general", label: "General", content: general },
    { id: "identity", label: "Site Identity", content: identity },
    { id: "media", label: "Media Library", content: media },
    { id: "branding", label: "Branding", content: branding },
  ] as const;

  const [active, setActive] = useState<(typeof tabs)[number]["id"]>("general");

  return (
    <div>
      <div className="mt-7 flex gap-2 border-b border-line">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={`-mb-px mr-7 border-b-2 pb-3.5 text-sm font-semibold transition ${
              active === tab.id
                ? "border-brand text-ink"
                : "border-transparent text-ink/45 hover:text-ink"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="pt-7">{tabs.find((t) => t.id === active)?.content}</div>
    </div>
  );
}
