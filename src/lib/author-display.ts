import type { Profile } from "./database.types.ts";

export function getPublicAuthorName(
  author?: Pick<Profile, "full_name"> | null,
): string | null {
  const name = author?.full_name?.trim();
  if (!name || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(name)) return null;
  return name;
}
