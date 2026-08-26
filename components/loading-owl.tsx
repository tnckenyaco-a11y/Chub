"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export function LoadingOwl({
  size = 64,
  label,
  className = "",
}: {
  size?: number;
  label?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <div className="relative" style={{ width: size, height: size * 0.7 }}>
        <motion.div
          className="absolute inset-0 rounded-full bg-grad-brand blur-xl"
          animate={{ opacity: [0.15, 0.4, 0.15], scale: [0.85, 1.05, 0.85] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="relative h-full w-full"
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.div
            className="relative h-full w-full"
            animate={{ scaleY: [1, 1, 0.12, 1, 1] }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.78, 0.85, 0.92, 1],
            }}
          >
            <Image src="/logo-icon-purple.png" alt="" fill className="object-contain" priority />
          </motion.div>
        </motion.div>
      </div>
      {label && (
        <p className="text-xs font-semibold uppercase tracking-wide text-ink/40">{label}</p>
      )}
    </div>
  );
}
