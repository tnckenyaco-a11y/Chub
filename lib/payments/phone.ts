// Shared by every payment provider — both IntaSend and Daraja expect Kenyan
// phone numbers in 2547XXXXXXXX / 2541XXXXXXXX format (no leading +).
export function normalizeKenyanPhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0")) return `254${digits.slice(1)}`;
  if (digits.startsWith("7") || digits.startsWith("1")) return `254${digits}`;
  return digits;
}
