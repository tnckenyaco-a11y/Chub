const HEX_RE = /^#[0-9a-f]{6}$/i;

export function isValidHex(value: string): boolean {
  return HEX_RE.test(value);
}

// amount is -1..1: negative darkens toward black, positive lightens toward white.
export function shadeHex(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 0xff;
  const g = (n >> 8) & 0xff;
  const b = n & 0xff;

  const mix = (channel: number) =>
    amount < 0 ? Math.round(channel * (1 + amount)) : Math.round(channel + (255 - channel) * amount);

  const toHex = (channel: number) => Math.max(0, Math.min(255, channel)).toString(16).padStart(2, "0");

  return `#${toHex(mix(r))}${toHex(mix(g))}${toHex(mix(b))}`;
}
