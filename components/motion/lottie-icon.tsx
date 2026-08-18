"use client";

import { Lottie } from "lottie-react";

export function LottieIcon({ src, className }: { src: string; className?: string }) {
  return (
    <div className={className}>
      <Lottie src={src} autoplay loop className="h-full w-full" />
    </div>
  );
}
