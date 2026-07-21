export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function timeAgo(dateString: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, secondsInUnit] of units) {
    const value = Math.floor(seconds / secondsInUnit);
    if (value >= 1) {
      return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(-value, unit);
    }
  }
  return "just now";
}
