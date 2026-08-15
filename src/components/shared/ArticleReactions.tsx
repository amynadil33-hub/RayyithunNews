import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ArticleReactionName } from "../../lib/database.types.ts";
import {
  getArticleReactions,
  setArticleReaction,
} from "../../services/reactions.ts";

const REACTIONS: { name: ArticleReactionName; emoji: string; label: string }[] =
  [
    { name: "heart", emoji: "❤️", label: "Heart" },
    { name: "sad", emoji: "😢", label: "Sad" },
    { name: "angry", emoji: "😡", label: "Angry" },
    { name: "surprised", emoji: "😮", label: "Surprised" },
    { name: "like", emoji: "👍", label: "Like" },
    { name: "happy", emoji: "😊", label: "Happy" },
  ];

const READER_KEY_STORAGE = "rayyithun_reader_key";

function getReaderKey() {
  if (typeof window === "undefined") return "";
  const saved = window.localStorage.getItem(READER_KEY_STORAGE);
  if (saved) return saved;
  const key = window.crypto.randomUUID();
  window.localStorage.setItem(READER_KEY_STORAGE, key);
  return key;
}

export default function ArticleReactions({
  articleId,
  isDhivehi = false,
}: {
  articleId: string;
  isDhivehi?: boolean;
}) {
  const queryClient = useQueryClient();
  const readerKey = useMemo(getReaderKey, []);
  const queryKey = ["article-reactions", articleId];
  const { data: reactions = [] } = useQuery({
    queryKey,
    queryFn: () => getArticleReactions(articleId),
  });
  const mutation = useMutation({
    mutationFn: (reaction: ArticleReactionName) =>
      setArticleReaction(articleId, readerKey, reaction),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey }),
  });

  const selected = reactions.find(
    (reaction) => reaction.reader_key === readerKey,
  )?.reaction;
  const counts = reactions.reduce<Partial<Record<ArticleReactionName, number>>>(
    (result, reaction) => {
      result[reaction.reaction] = (result[reaction.reaction] ?? 0) + 1;
      return result;
    },
    {},
  );

  return (
    <section
      className={`mt-10 rounded-sm border border-[#D8E8D8] bg-white p-5 sm:p-6 ${isDhivehi ? "font-thaana text-right" : ""}`}
      dir={isDhivehi ? "rtl" : "ltr"}
      aria-labelledby={`reaction-heading-${articleId}`}
    >
      <h2
        id={`reaction-heading-${articleId}`}
        className="mb-4 text-lg font-bold text-[#142820]"
      >
        {isDhivehi
          ? "މި ލިޔުން ކިޔާލުމުން"
          : "How did this article make you feel?"}
      </h2>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {REACTIONS.map((reaction) => {
          const active = selected === reaction.name;
          return (
            <button
              key={reaction.name}
              type="button"
              disabled={mutation.isPending}
              aria-label={reaction.label}
              aria-pressed={active}
              onClick={() => mutation.mutate(reaction.name)}
              className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-lg border px-2 py-2 transition-colors disabled:opacity-60 ${
                active
                  ? "border-[#103820] bg-[#D8E8D8] text-[#103820]"
                  : "border-[#E5E7E2] bg-[#F8FAF8] text-[#526159] hover:border-[#52B788] hover:bg-[#EFF7F0]"
              }`}
            >
              <span className="text-2xl" aria-hidden="true">
                {reaction.emoji}
              </span>
              <span className="font-sans text-xs font-semibold">
                {counts[reaction.name] ?? 0}
              </span>
            </button>
          );
        })}
      </div>
      {mutation.isError && (
        <p className="mt-3 text-xs text-red-700">
          {isDhivehi
            ? "ރިއެކްޝަން ސޭވް ނުކުރެވުނު."
            : "Your reaction could not be saved."}
        </p>
      )}
    </section>
  );
}
