"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};
const getServerSnapshot = () => null;

// Timestamp formatting depends on the viewer's timezone/locale, which can
// differ from the server's — rendering null on the server and the real
// formatted value on the client avoids a hydration mismatch instead of
// guessing wrong on first paint.
export function ClientTime({ iso, format }: { iso: string; format: (iso: string) => string }) {
  const text = useSyncExternalStore(noopSubscribe, () => format(iso), getServerSnapshot);
  return <>{text}</>;
}
