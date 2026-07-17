"use client";

export function AutoSubmitFileInput({
  name,
  accept,
}: {
  name: string;
  accept: string;
}) {
  return (
    <label className="cursor-pointer rounded-full border border-line px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ink hover:border-volt">
      Upload
      <input
        type="file"
        name={name}
        accept={accept}
        className="hidden"
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
      />
    </label>
  );
}
