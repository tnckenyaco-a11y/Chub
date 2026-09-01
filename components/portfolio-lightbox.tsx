"use client";

import { useEffect, useState } from "react";
import { FileText, MessageCircle, X, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { SubmitButton } from "@/components/submit-button";

export type PortfolioItem = {
  id: string;
  title: string | null;
  description: string | null;
  file_url: string;
  file_type: string;
  link_url: string | null;
};

export function PortfolioLightbox({
  items,
  creativeName,
  messageAction,
}: {
  items: PortfolioItem[];
  creativeName: string;
  // Bound server action (creativeId already applied) — present only when
  // the viewer is signed in, a brand, and not the profile's own owner.
  messageAction: ((formData: FormData) => void) | null;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenIndex(null);
      if (e.key === "ArrowRight") setOpenIndex((i) => (i === null ? i : Math.min(i + 1, items.length - 1)));
      if (e.key === "ArrowLeft") setOpenIndex((i) => (i === null ? i : Math.max(i - 1, 0)));
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [openIndex, items.length]);

  if (!items.length) {
    return <p className="text-sm text-ink/40">No portfolio pieces added yet.</p>;
  }

  const active = openIndex !== null ? items[openIndex] : null;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        {items.map((item, i) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setOpenIndex(i)}
            className="group block overflow-hidden rounded-xl border border-line text-left transition hover:shadow-md"
          >
            {item.file_type === "pdf" ? (
              <div className="flex h-36 items-center justify-center bg-bg text-xs uppercase text-ink/60">
                <FileText className="mr-1.5 h-4 w-4" /> PDF Document
              </div>
            ) : (
              <div
                className="h-36 bg-cover bg-center transition group-hover:scale-[1.02]"
                style={{ backgroundImage: `url(${item.file_url})` }}
              />
            )}
            {item.title && <p className="truncate p-2 text-xs text-ink/70">{item.title}</p>}
          </button>
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4"
          onClick={() => setOpenIndex(null)}
        >
          <div
            className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-paper shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(null)}
              aria-label="Close"
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-ink/60 text-paper hover:bg-ink/80"
            >
              <X className="h-4 w-4" />
            </button>

            {openIndex! > 0 && (
              <button
                type="button"
                onClick={() => setOpenIndex((i) => (i === null ? i : i - 1))}
                aria-label="Previous"
                className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-ink/60 text-paper hover:bg-ink/80"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
            {openIndex! < items.length - 1 && (
              <button
                type="button"
                onClick={() => setOpenIndex((i) => (i === null ? i : i + 1))}
                aria-label="Next"
                className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-ink/60 text-paper hover:bg-ink/80"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            )}

            {active.file_type === "pdf" ? (
              <div className="flex h-72 items-center justify-center bg-bg">
                <a
                  href={active.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-full bg-grad-brand px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-paper shadow-sm transition hover:opacity-90"
                >
                  <FileText className="h-4 w-4" /> Open PDF
                </a>
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={active.file_url}
                alt={active.title ?? "Portfolio piece"}
                className="max-h-[55vh] w-full bg-bg object-contain"
              />
            )}

            <div className="overflow-y-auto p-6">
              <p className="font-display text-xl text-ink">{active.title || "Untitled"}</p>
              {active.description && (
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink/70">
                  {active.description}
                </p>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                {active.link_url && (
                  <a
                    href={active.link_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink/60 hover:text-brand"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> View Original
                  </a>
                )}
                {messageAction && (
                  <form
                    action={messageAction}
                    className="ml-auto"
                  >
                    <input
                      type="hidden"
                      name="about"
                      value={`Hi ${creativeName.split(" ")[0]}, I saw your portfolio piece "${
                        active.title || "your work"
                      }" and wanted to talk about a project.`}
                    />
                    <SubmitButton
                      pendingText="Opening…"
                      className="flex items-center gap-1.5 rounded-full bg-grad-brand px-4 py-2 text-xs font-semibold uppercase tracking-wide text-paper shadow-sm transition hover:opacity-90"
                    >
                      <MessageCircle className="h-3.5 w-3.5" /> Message About This
                    </SubmitButton>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
