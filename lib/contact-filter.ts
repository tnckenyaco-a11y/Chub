const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
const OBFUSCATED_EMAIL_RE =
  /[a-z0-9._%+-]+\s*(\(at\)|\[at\]|\bat\b)\s*[a-z0-9.-]+\s*(\(dot\)|\[dot\]|\bdot\b)\s*(com|net|org|co\.ke|co)\b/i;

// Spaces only (not comma/dash) so price ranges like "15,000-20,000" don't
// false-positive — Kenyan numbers are typically written with space groups
// ("0712 345 678", "+254 712 345 678").
const PHONE_CANDIDATE_RE = /\+?\d[\d ]{7,}\d/g;
const MIN_PHONE_DIGITS = 9;

export function containsContactInfo(text: string): boolean {
  if (EMAIL_RE.test(text) || OBFUSCATED_EMAIL_RE.test(text)) return true;

  const candidates = text.match(PHONE_CANDIDATE_RE) ?? [];
  return candidates.some((c) => c.replace(/\D/g, "").length >= MIN_PHONE_DIGITS);
}

// Direct-messaging-app domains — same intent as containsContactInfo, but for
// URL-shaped fields (website/social links) where the general phone-digit
// heuristic false-positives on ordinary platform IDs (a YouTube channel URL
// routinely contains an 8+ digit run with no separators).
const CONTACT_LINK_DOMAIN_RE = /\b(wa\.me|api\.whatsapp\.com|whatsapp\.com|t\.me|telegram\.me|m\.me|messenger\.com)\b/i;

export function containsContactLink(url: string): boolean {
  return EMAIL_RE.test(url) || OBFUSCATED_EMAIL_RE.test(url) || CONTACT_LINK_DOMAIN_RE.test(url);
}

export const CONTACT_INFO_BLOCKED_MESSAGE =
  "For your safety, phone numbers and email addresses can't be sent in messages. Keep the conversation and payments on Nyx Creators Hub.";
