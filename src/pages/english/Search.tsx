import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import EnglishHeader from "../../components/english/EnglishHeader.tsx";
import EnglishFooter from "../../components/english/EnglishFooter.tsx";
import ArticleCard from "../../components/english/ArticleCard.tsx";
import { useArticles } from "../../hooks/use-portal-data.ts";
import { Skeleton } from "../../components/ui/skeleton.tsx";
import { SearchIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function EnglishSearch() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const [input, setInput] = useState(q);
  const navigate = useNavigate();

  const { data: results, isLoading } = useArticles({
    portalSlug: "english",
    search: q || undefined,
    limit: 20,
  });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (input.trim()) navigate(`/en/search?q=${encodeURIComponent(input.trim())}`);
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <Helmet>
        <title>Search: {q} — RAYYITHUN</title>
      </Helmet>
      <EnglishHeader />

      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="font-serif text-2xl font-bold text-[#142820] mb-6">Search</h1>

        <form onSubmit={handleSearch} className="flex gap-3 mb-8">
          <div className="flex-1 flex items-center border border-[#E5E7E2] rounded-sm bg-white px-4">
            <SearchIcon size={16} className="text-[#6B756E] mr-2 flex-shrink-0" />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Search articles..."
              className="flex-1 py-3 text-sm bg-transparent focus:outline-none text-[#142820]"
            />
          </div>
          <button type="submit" className="bg-[#103820] text-white px-6 rounded-sm text-sm font-medium hover:bg-[#183028] transition-colors">
            Search
          </button>
        </form>

        {q && (
          <p className="text-sm text-[#6B756E] mb-6">
            {isLoading ? "Searching..." : `${results?.length ?? 0} results for "${q}"`}
          </p>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {(results ?? []).map((article) => (
              <ArticleCard key={article.id} article={article} variant="grid" />
            ))}
          </div>
        )}

        {!isLoading && q && (!results || results.length === 0) && (
          <div className="text-center py-16">
            <SearchIcon size={40} className="mx-auto text-[#D8E8D8] mb-4" />
            <p className="text-[#6B756E]">No results found for "{q}"</p>
          </div>
        )}
      </div>

      <EnglishFooter />
    </div>
  );
}
