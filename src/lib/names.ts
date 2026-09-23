type Named = { firstName: string | null; lastName: string | null; nickname: string };

/** "Jana Nováková", or null when the player gave no name. */
export function fullName(r: Named): string | null {
  const s = [r.firstName, r.lastName].filter(Boolean).join(" ").trim();
  return s || null;
}

/** First name for greetings, falling back to the nickname. */
export function greetingName(r: Named): string {
  return r.firstName?.trim() || r.nickname;
}
