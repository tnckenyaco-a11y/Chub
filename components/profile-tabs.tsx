"use client";

import { useState, type ReactNode } from "react";

export function ProfileTabs({
  about,
  portfolio,
  services,
  reviews,
}: {
  about: ReactNode;
  portfolio: ReactNode;
  services: ReactNode;
  reviews: ReactNode;
}) {
  const tabs = [
    { id: "about", label: "About", content: about },
    { id: "portfolio", label: "Portfolio", content: portfolio },
    { id: "services", label: "Services", content: services },
    { id: "reviews", label: "Reviews", content: reviews },
  ] as const;

  const [active, setActive] = useState<(typeof tabs)[number]["id"]>("about");

  return (
    <div>
      <div className="flex gap-8 border-b border-line">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={`-mb-px border-b-2 pb-3 text-sm font-semibold transition ${
              active === tab.id
                ? "border-brand text-brand"
                : "border-transparent text-ink/45 hover:text-ink"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="pt-8">{tabs.find((t) => t.id === active)?.content}</div>
    </div>
  );
}
