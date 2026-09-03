import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SearchIcon } from "lucide-react";
import DhivehiHeader from "../../components/dhivehi/DhivehiHeader.tsx";
import DhivehiFooter from "../../components/dhivehi/DhivehiFooter.tsx";
import DhivehiArticleCard from "../../components/dhivehi/DhivehiArticleCard.tsx";
import { Skeleton } from "../../components/ui/skeleton.tsx";
import { useArticles } from "../../hooks/use-portal-data.ts";

export default function DhivehiSearch() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const [input, setInput] = useState(query);
  const navigate = useNavigate();
  const { data: results, isLoading } = useArticles({
    portalSlug: "dhivehi",
    search: query || undefined,
    limit: 20,
  });

  function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    if (input.trim()) navigate(`/search?q=${encodeURIComponent(input.trim())}`);
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8]" dir="rtl" lang="dv">
      <Helmet>
        <title>ހޯދާ: {query} — ރައްޔިތުން</title>
      </Helmet>
      <DhivehiHeader />

      <main className="mx-auto max-w-5xl px-3 py-8 sm:px-4 sm:py-10">
        <h1 className="mb-5 font-thaana thaana-headline text-2xl font-bold text-[#142820] sm:mb-6">
          ހޯދާ
        </h1>
        <form
          onSubmit={handleSearch}
          className="mb-7 flex gap-2 sm:mb-8 sm:gap-3"
        >
          <div className="flex min-w-0 flex-1 items-center rounded-sm border border-[#E5E7E2] bg-white px-3 sm:px-4">
            <SearchIcon size={17} className="ml-2 shrink-0 text-[#6B756E]" />
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="ހަބަރު ހޯދާ..."
              className="min-h-11 min-w-0 flex-1 bg-transparent py-3 text-right text-sm text-[#142820] outline-none font-thaana"
            />
          </div>
          <button
            type="submit"
            className="min-h-11 shrink-0 rounded-sm bg-[#103820] px-5 text-sm font-medium text-white transition-colors hover:bg-[#183028] font-thaana"
          >
            ހޯދާ
          </button>
        </form>

        {query && (
          <p className="mb-6 text-sm text-[#6B756E] font-thaana">
            {isLoading
              ? "ހޯދަނީ..."
              : `${results?.length ?? 0} ނަތީޖާ ލިބިއްޖެ`}
          </p>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-24 w-full" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
            {(results ?? []).map((article) => (
              <DhivehiArticleCard
                key={article.id}
                article={article}
                variant="grid"
              />
            ))}
          </div>
        )}

        {!isLoading && query && (!results || results.length === 0) && (
          <div className="py-14 text-center font-thaana">
            <SearchIcon size={40} className="mx-auto mb-4 text-[#D8E8D8]" />
            <p className="text-[#6B756E]">ނަތީޖާއެއް ނުލިބުނު</p>
          </div>
        )}
      </main>
      <DhivehiFooter />
    </div>
  );
}
