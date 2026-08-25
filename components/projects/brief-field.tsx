"use client";

import { useRef, useState } from "react";
import { Paperclip, Sparkles, X } from "lucide-react";

export function BriefField({ titleFieldId }: { titleFieldId: string }) {
  const [description, setDescription] = useState("");
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [briefFile, setBriefFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleGenerate() {
    if (!prompt.trim() || generating) return;
    setGenerating(true);
    setError(null);

    const titleInput = document.getElementById(titleFieldId) as HTMLInputElement | null;

    try {
      const res = await fetch("/api/projects/generate-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, title: titleInput?.value ?? "" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Couldn't generate a brief.");
      setDescription(data.brief);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't generate a brief.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div>
      <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">
        Description / Creative Brief
      </span>
      <textarea
        name="description"
        rows={5}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe the project, or generate a brief with Nyx AI below…"
        className="mt-1.5 w-full rounded-lg border border-line bg-transparent px-4 py-3 text-ink outline-none focus:border-brand"
      />

      <div className="mt-3 rounded-lg border border-line bg-bg p-3">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-ink/60">
          <Sparkles className="h-3.5 w-3.5 text-brand" /> Generate with Nyx AI
        </p>
        <div className="mt-2 flex gap-2">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Need 5 product photos for our new skincare line"
            className="flex-1 rounded-lg border border-line bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-brand"
          />
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating || !prompt.trim()}
            className="shrink-0 rounded-lg bg-grad-brand px-4 py-2 text-xs font-semibold uppercase tracking-wide text-paper shadow-sm transition hover:opacity-90 disabled:opacity-50"
          >
            {generating ? "Writing…" : "Generate"}
          </button>
        </div>
        {error && <p className="mt-2 text-xs text-magenta">{error}</p>}
      </div>

      <div className="mt-3">
        {briefFile ? (
          <div className="flex w-fit items-center gap-2 rounded-full border border-line bg-bg px-3 py-1.5 text-xs text-ink/70">
            <Paperclip className="h-3 w-3" />
            <span className="max-w-[220px] truncate">{briefFile.name}</span>
            <button
              type="button"
              onClick={() => {
                setBriefFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="text-ink/40 hover:text-ink"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <label className="flex w-fit cursor-pointer items-center gap-1.5 text-xs text-ink/50 hover:text-brand">
            <Paperclip className="h-3.5 w-3.5" /> Or attach a brief document (PDF or image)
          </label>
        )}
        <input
          ref={fileInputRef}
          type="file"
          name="brief"
          accept="image/png,image/jpeg,image/webp,image/gif,application/pdf"
          className={briefFile ? "hidden" : "mt-1.5 block text-xs text-ink/60"}
          onChange={(e) => setBriefFile(e.target.files?.[0] ?? null)}
        />
      </div>
    </div>
  );
}
