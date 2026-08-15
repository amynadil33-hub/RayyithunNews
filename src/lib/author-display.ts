import type { Profile } from "./database.types.ts";

export function getPublicAuthorName(
  author?: Pick<Profile, "full_name" | "full_name_dv" | "email"> | null,
  isDhivehi = false,
): string | null {
  const candidates = isDhivehi
    ? [author?.full_name_dv, author?.full_name, author?.email]
    : [author?.full_name, author?.email];
  return candidates.find((value) => value?.trim())?.trim() ?? null;
}
