"use client";

import { useState } from "react";

export function ImageGallery({ images }: { images: string[] }) {
  const [active, setActive] = useState(0);
  if (!images.length) return null;

  return (
    <div>
      <div
        className="h-72 rounded-2xl bg-cover bg-center sm:h-96"
        style={{ backgroundImage: `url(${images[active]})` }}
      />
      {images.length > 1 && (
        <div className="mt-3 flex gap-3 overflow-x-auto">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              className={`h-16 w-16 shrink-0 rounded-lg bg-cover bg-center transition ${
                i === active ? "ring-2 ring-volt" : "opacity-60 hover:opacity-100"
              }`}
              style={{ backgroundImage: `url(${src})` }}
              aria-label={`Show image ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
