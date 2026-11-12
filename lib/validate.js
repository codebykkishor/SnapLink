import { randomInt } from "crypto";

const ALPHABET =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

// Words that would clash with real pages/routes of the app.
const RESERVED = ["shorten", "api", "about", "contact", "github"];

// Random 6-character slug, e.g. "aB3xYz".
export function generateSlug(length = 6) {
  let slug = "";
  for (let i = 0; i < length; i++) slug += ALPHABET[randomInt(ALPHABET.length)];
  return slug;
}

// Accepts "google.com" or "https://google.com". Returns a clean URL string,
// or null if it is not a valid http/https URL.
export function normalizeUrl(input) {
  if (typeof input !== "string") return null;
  let value = input.trim();
  if (!value) return null;
  if (!/^[a-zA-Z][a-zA-Z\d+.-]*:\/\//.test(value)) value = "https://" + value;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    if (!parsed.hostname.includes(".")) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

// Returns an error message, or null if the slug is fine.
export function checkSlug(slug) {
  if (!/^[a-zA-Z0-9_-]{3,30}$/.test(slug)) {
    return "Short text must be 3-30 characters: letters, numbers, - or _ only.";
  }
  if (RESERVED.includes(slug.toLowerCase())) {
    return "That short text is reserved. Please choose another.";
  }
  return null;
}
