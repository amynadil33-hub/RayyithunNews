import type { Profile } from "../../lib/database.types.ts";
import { getPublicAuthorName } from "../../lib/author-display.ts";

interface AuthorIdentityProps {
  author?: Pick<Profile, "full_name" | "avatar_url"> | null;
  className?: string;
}

export default function AuthorIdentity({
  author,
  className = "",
}: AuthorIdentityProps) {
  const name = getPublicAuthorName(author);
  if (!name) return null;

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      {author?.avatar_url ? (
        <img
          src={author.avatar_url}
          alt={`${name} profile`}
          className="h-5 w-5 shrink-0 rounded-full object-cover"
          loading="lazy"
        />
      ) : (
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#D8E8D8] text-[9px] font-bold text-[#103820]">
          {name.charAt(0).toUpperCase()}
        </span>
      )}
      <span>{name}</span>
    </span>
  );
}
