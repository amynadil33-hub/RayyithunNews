import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { TrendingUpIcon, PlayCircleIcon } from "lucide-react";
import EnglishFooter from "../../components/english/EnglishFooter.tsx";
import ArticleCard from "../../components/english/ArticleCard.tsx";
import AdBanner from "../../components/shared/AdBanner.tsx";
import NewsletterSection from "../../components/shared/NewsletterSection.tsx";
import FrigatebirdHero from "../../components/shared/FrigatebirdHero.tsx";
import { useArticles, usePodcasts } from "../../hooks/use-portal-data.ts";
import { Skeleton } from "../../components/ui/skeleton.tsx";
import { format } from "date-fns";

const CATEGORIES = [
  { name: "News", slug: "news" },
  { name: "Education", slug: "education" },
  { name: "Business", slug: "business" },
  { name: "Religion", slug: "religion" },
  { name: "Innovation", slug: "innovation" },
  { name: "World", slug: "world" },
  { name: "Citizen", slug: "citizen" },
  { name: "Market", slug: "market" },
];

export default function EnglishHome() {
  const { data: featured, isLoading: featuredLoading } = useArticles({ portalSlug: "english", isFeatured: true, limit: 4 });
  const { data: trending, isLoading: trendingLoading } = useArticles({ portalSlug: "english", isTrending: true, limit: 5 });
  const { data: latest, isLoading: latestLoading } = useArticles({ portalSlug: "english", limit: 9 });
  const { data: podcasts } = usePodcasts("english", 3);

  const heroArticle = featured?.[0];
  const secondaryArticles = featured?.slice(1, 4) ?? [];

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <Helmet>
        <title>RAYYITHUN — The Voice of the Maldives</title>
        <meta name="description" content="Independent news from the Maldives. Politics, business, education, and community stories." />
        <meta property="og:title" content="RAYYITHUN — The Voice of the Maldives" />
        <meta property="og:description" content="Independent news from the Maldives." />
        <html lang="en" />
      </Helmet>

      <FrigatebirdHero language="en" />

      {/* Top ad banner */}
      <div className="max-w-5xl mx-auto px-4 pt-4">
        <AdBanner placement="homepage_top_banner" label="Advertisement" />
      </div>

      {/* Hero section */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        {featuredLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 h-80">
            <Skeleton className="md:col-span-3 h-full" />
            <div className="md:col-span-2 space-y-4">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 min-h-[340px]">
            <div className="md:col-span-3">
              {heroArticle ? (
                <ArticleCard article={heroArticle} variant="hero" />
              ) : (
                <div className="h-full min-h-[300px] bg-[#103820] rounded-sm flex items-center justify-center">
                  <span className="font-serif text-white text-3xl font-bold opacity-20">RAYYITHUN</span>
                </div>
              )}
            </div>
            <div className="md:col-span-2 flex flex-col gap-4 divide-y divide-[#E5E7E2]">
              {secondaryArticles.length > 0
                ? secondaryArticles.map((a) => (
                    <div key={a.id} className="first:pt-0 pt-4">
                      <ArticleCard article={a} variant="secondary" />
                    </div>
                  ))
                : latest?.slice(0, 3).map((a) => (
                    <div key={a.id} className="first:pt-0 pt-4">
                      <ArticleCard article={a} variant="secondary" />
                    </div>
                  ))}
            </div>
          </div>
        )}
      </section>

      {/* Trending strip */}
      <section className="bg-[#D8E8D8] py-5 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUpIcon size={16} className="text-[#103820]" />
            <span className="text-xs font-bold tracking-widest uppercase text-[#103820]">Trending Now</span>
          </div>
          {trendingLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-5 md:gap-8 overflow-x-auto">
              {(trending ?? []).slice(0, 5).map((article, i) => (
                <ArticleCard key={article.id} article={article} variant="trending" index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Latest stories */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-xl font-bold text-[#142820] tracking-tight">Latest Stories</h2>
          <Link
            to="/en/news"
            className="flex items-center gap-1 text-sm text-[#103820] font-medium border border-[#103820] px-3 py-1 rounded-sm hover:bg-[#103820] hover:text-white transition-colors"
          >
            View All →
          </Link>
        </div>
        {latestLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {(latest ?? []).slice(0, 6).map((article) => (
              <ArticleCard key={article.id} article={article} variant="grid" />
            ))}
          </div>
        )}
      </section>

      {/* Mid banner ad */}
      <div className="max-w-5xl mx-auto px-4 pb-6">
        <AdBanner placement="homepage_mid_banner" label="Advertisement" />
      </div>

      {/* Category sections */}
      {CATEGORIES.slice(0, 4).map((cat) => (
        <CategorySection key={cat.slug} categorySlug={cat.slug} categoryName={cat.name} />
      ))}

      {/* Podcast section */}
      {podcasts && podcasts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-xl font-bold text-[#142820]">Latest Podcasts</h2>
            <Link to="/en/podcast" className="text-sm text-[#103820] font-medium hover:underline">
              All Episodes →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {podcasts.map((podcast) => (
              <div key={podcast.id} className="bg-white border border-[#E5E7E2] rounded-sm overflow-hidden flex gap-4 p-4">
                {podcast.cover_image_url ? (
                  <img
                    src={podcast.cover_image_url}
                    alt={podcast.title}
                    className="w-20 h-20 object-cover rounded-sm flex-shrink-0"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-20 h-20 bg-[#D8E8D8] rounded-sm flex-shrink-0 flex items-center justify-center">
                    <PlayCircleIcon size={24} className="text-[#103820]" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-[#142820] line-clamp-2 mb-1">{podcast.title}</h3>
                  {podcast.host && <p className="text-xs text-[#6B756E] mb-2">{podcast.host}</p>}
                  <div className="flex items-center gap-2">
                    <PlayCircleIcon size={16} className="text-[#103820]" />
                    {podcast.duration && <span className="text-xs text-[#6B756E]">{podcast.duration}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <NewsletterSection portalId="00000000-0000-0000-0000-000000000002" />
      <EnglishFooter />
    </div>
  );
}

function CategorySection({ categorySlug, categoryName }: { categorySlug: string; categoryName: string }) {
  const { data: articles, isLoading } = useArticles({ portalSlug: "english", categorySlug, limit: 4 });

  if (!isLoading && (!articles || articles.length === 0)) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-8 border-t border-[#E5E7E2]">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-serif text-xl font-bold text-[#142820]">{categoryName}</h2>
        <Link
          to={`/en/${categorySlug}`}
          className="text-sm text-[#103820] font-medium hover:underline"
        >
          More {categoryName} →
        </Link>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {(articles ?? []).slice(0, 4).map((article) => (
            <ArticleCard key={article.id} article={article} variant="grid" />
          ))}
        </div>
      )}
    </section>
  );
}
