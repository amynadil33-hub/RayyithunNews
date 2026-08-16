import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { TrendingUpIcon } from "lucide-react";
import DhivehiFooter from "../../components/dhivehi/DhivehiFooter.tsx";
import DhivehiArticleCard from "../../components/dhivehi/DhivehiArticleCard.tsx";
import AdBanner from "../../components/shared/AdBanner.tsx";
import NewsletterSection from "../../components/shared/NewsletterSection.tsx";
import DhivehiHeader from "../../components/dhivehi/DhivehiHeader.tsx";
import { useArticles } from "../../hooks/use-portal-data.ts";
import { Skeleton } from "../../components/ui/skeleton.tsx";
import IslandPulseSection from "../../components/shared/IslandPulseSection.tsx";
import HomepageEditorialHero from "../../components/shared/HomepageEditorialHero.tsx";
import BreakingNewsStrip from "../../components/shared/BreakingNewsStrip.tsx";

const DV_CATEGORIES = [
  { name: "ހަބަރު", slug: "dv-news" },
  { name: "ތައުލީމު", slug: "dv-education" },
  { name: "ވިޔަފާރި", slug: "dv-business" },
  { name: "ތެދުމަގު", slug: "dv-religion" },
  { name: "ފަތުރުވެރިކަން", slug: "travel-tourism" },
];

export default function DhivehiHome() {
  const { data: featured, isLoading: featuredLoading } = useArticles({
    portalSlug: "dhivehi",
    isFeatured: true,
    limit: 4,
  });
  const { data: trending, isLoading: trendingLoading } = useArticles({
    portalSlug: "dhivehi",
    isTrending: true,
    limit: 5,
  });
  const { data: breaking, isLoading: breakingLoading } = useArticles({
    portalSlug: "dhivehi",
    isBreaking: true,
    limit: 5,
  });
  const { data: latest, isLoading: latestLoading } = useArticles({
    portalSlug: "dhivehi",
    limit: 9,
  });
  const heroArticle = featured?.[0] ?? latest?.[0];
  const secondaryArticles =
    featured && featured.length > 1
      ? featured.slice(1, 4)
      : (latest?.slice(1, 4) ?? []);
  const breakingArticles = breaking?.length ? breaking : (latest ?? []);

  return (
    <div className="min-h-screen bg-[#F8F8F8]" dir="rtl" lang="dv">
      <Helmet>
        <title>ރައްޔިތުން — ރާއްޖޭގެ ހަބަރު</title>
        <meta
          name="description"
          content="ދިވެހިރާއްޖޭގެ ހަބަރު. ސިޔާސަތު، ވިޔަފާރި، ތަޢުލީމް، ރައްޔިތުންގެ ވާހަކަ."
        />
        <html lang="dv" dir="rtl" />
      </Helmet>

      <DhivehiHeader />

      {/* Hero section */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        {featuredLoading ? (
          <div className="space-y-5">
            <Skeleton className="h-[520px] md:h-[360px]" />
            <div className="grid gap-3 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-28" />
              ))}
            </div>
          </div>
        ) : (
          <HomepageEditorialHero
            article={heroArticle}
            topStories={secondaryArticles}
            language="dhivehi"
          />
        )}
      </section>

      <BreakingNewsStrip
        articles={breakingArticles}
        language="dhivehi"
        isLoading={breakingLoading || latestLoading}
      />

      {/* First advertisement follows the featured story */}
      <div className="max-w-5xl mx-auto px-4 pb-6">
        <AdBanner placement="homepage_top_banner" label="އިޢުލާން" />
      </div>

      {/* Trending strip */}
      <section className="bg-[#D8E8D8] py-2.5 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-2 justify-end">
            <span className="text-xs font-bold tracking-widest uppercase text-[#103820] font-thaana">
              ޓްރެންޑިން ހަބަރު
            </span>
            <TrendingUpIcon size={16} className="text-[#103820] rtl-flip" />
          </div>
          {trendingLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-5 md:gap-8 overflow-x-auto">
              {(trending ?? []).slice(0, 5).map((article, i) => (
                <DhivehiArticleCard
                  key={article.id}
                  article={article}
                  variant="trending"
                  index={i}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-[270px_minmax(0,1fr)] lg:items-start">
          <IslandPulseSection language="dhivehi" variant="sidebar" />

          <div className="min-w-0">
            <div className="flex items-center justify-between mb-6">
              <Link
                to="/news"
                className="flex items-center gap-1 text-sm text-[#103820] font-medium border border-[#103820] px-3 py-1 rounded-sm hover:bg-[#103820] hover:text-white transition-colors font-thaana"
              >
                ← ހުރިހ
              </Link>
              <h2 className="font-thaana thaana-headline text-xl font-bold text-[#142820]">
                އެންމެ ފަހުގެ ހަބަރު
              </h2>
            </div>
            {latestLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-64" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {(latest ?? []).slice(0, 6).map((article) => (
                  <DhivehiArticleCard
                    key={article.id}
                    article={article}
                    variant="grid"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Mid banner ad */}
      <div className="max-w-5xl mx-auto px-4 pb-6">
        <AdBanner placement="homepage_mid_banner" label="އިޢުލާން" />
      </div>

      {/* Category sections */}
      {DV_CATEGORIES.map((cat) => (
        <DhivehiCategorySection
          key={cat.slug}
          categorySlug={cat.slug}
          categoryName={cat.name}
        />
      ))}

      <NewsletterSection
        portalId="00000000-0000-0000-0000-000000000001"
        isDhivehi
      />
      <DhivehiFooter />
    </div>
  );
}

function DhivehiCategorySection({
  categorySlug,
  categoryName,
}: {
  categorySlug: string;
  categoryName: string;
}) {
  const { data: articles, isLoading } = useArticles({
    portalSlug: "dhivehi",
    categorySlug,
    limit: 4,
  });

  if (!isLoading && (!articles || articles.length === 0)) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-8 border-t border-[#E5E7E2]">
      <div className="flex items-center justify-between mb-5">
        <Link
          to={`/${categorySlug.replace("dv-", "")}`}
          className="text-sm text-[#103820] font-medium hover:underline font-thaana"
        >
          ← އިތުރު {categoryName}
        </Link>
        <h2 className="font-thaana thaana-headline text-xl font-bold text-[#142820]">
          {categoryName}
        </h2>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {(articles ?? []).slice(0, 4).map((article) => (
            <DhivehiArticleCard
              key={article.id}
              article={article}
              variant="grid"
            />
          ))}
        </div>
      )}
    </section>
  );
}
