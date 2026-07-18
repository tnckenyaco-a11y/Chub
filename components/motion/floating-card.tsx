"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export function FloatingCard({
  src,
  alt,
  caption,
  sub,
  className,
  rotate = 0,
  delay = 0,
}: {
  src: string;
  alt: string;
  caption: string;
  sub?: string;
  className?: string;
  rotate?: number;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotate: rotate * 2 }}
      animate={{ opacity: 1, y: 0, rotate }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ rotate: 0, scale: 1.05 }}
      className={`pointer-events-auto absolute hidden overflow-hidden rounded-2xl border border-paper/10 shadow-2xl lg:block ${className ?? ""}`}
    >
      <div className="relative h-44 w-36 xl:h-48 xl:w-40">
        <Image src={src} alt={alt} fill sizes="160px" className="object-cover" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent p-3 pt-8">
          <p className="text-xs font-semibold leading-tight text-paper">{caption}</p>
          {sub && <p className="mt-0.5 text-[11px] leading-tight text-paper/70">{sub}</p>}
        </div>
      </div>
    </motion.div>
  );
}
