/**
 * Normalizes a free-text admin search before it is interpolated into a PostgREST
 * `or=(col.ilike.*term*)` filter. Commas, parentheses, quotes, wildcards and backslashes
 * would otherwise change the filter grammar, so they are replaced with spaces.
 */
export function sanitizeAdminSearch(raw: unknown, maxLength = 80) {
  if (typeof raw !== "string") return "";
  return raw
    .replace(/[,()"'%*\\:]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

/** Reads one string value from Next.js searchParams, ignoring repeated keys. */
export function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

/** Returns `value` only when it is one of `allowed`, otherwise the fallback. */
export function pickOption<T extends string>(value: string, allowed: readonly T[], fallback: T): T {
  return (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}
