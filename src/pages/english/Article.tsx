import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import {
  getArticleBySlug,
  getRelatedArticles,
} from "../../services/articles.ts";
import EnglishHeader from "../../components/english/EnglishHeader.tsx";
import EnglishFooter from "../../components/english/EnglishFooter.tsx";
import ArticleCard from "../../components/english/ArticleCard.tsx";
import AdBanner from "../../components/shared/AdBanner.tsx";
import NewsletterSection from "../../components/shared/NewsletterSection.tsx";
import { Skeleton } from "../../components/ui/skeleton.tsx";
import { format } from "date-fns";
import ArticleShareButtons from "../../components/shared/ArticleShareButtons.tsx";
import { getAbsoluteSiteUrl, getCanonicalPageUrl } from "../../lib/site-url.ts";
import {
  getArticleImageHeight,
  getArticleImageUrl,
} from "../../lib/article-images.ts";
import { sanitizeArticleHtml } from "../../lib/sanitizeHtml.ts";
import {
  ArticleAuthorMeta,
  ArticleComments,
  ArticleLiveTimeline,
  ArticleTags,
} from "../../components/shared/ArticleNewsroom.tsx";

export default function EnglishArticle() {
  const { slug } = useParams<{ slug: string }>();

  const { data: article, isLoading } = useQuery({
    queryKey: ["article", "english", slug],
    queryFn: () => getArticleBySlug("english", slug!),
    enabled: !!slug,
  });

  const { data: related } = useQuery({
    queryKey: ["related", article?.id],
    queryFn: () =>
      getRelatedArticles(
        article!.id,
        article!.category_id!,
        article!.portal_id,
      ),
    enabled: !!article?.category_id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F8F8]">
        <EnglishHeader />
        <div className="max-w-4xl mx-auto px-4 py-10 space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="w-full h-72" />
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
        <EnglishFooter />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-[#F8F8F8]">
        <EnglishHeader />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="font-serif text-3xl font-bold text-[#142820] mb-4">
            Article Not Found
          </h1>
          <Link to="/en" className="text-[#103820] underline">
            ← Back to home
          </Link>
        </div>
        <EnglishFooter />
      </div>
    );
  }

  const publishDate = article.published_at
    ? format(new Date(article.published_at), "d MMMM yyyy")
    : "";
  const canonicalUrl = getCanonicalPageUrl();
  const shareImage = getAbsoluteSiteUrl(
    article.og_image_url ?? article.featured_image_url,
  );

  return (
    <div className="min-h-screen bg-[#F8F8F8]" lang="en" dir="ltr">
      <Helmet>
        <title>{article.seo_title ?? article.title} — RAYYITHUN</title>
        <meta
          name="description"
          content={article.seo_description ?? article.excerpt ?? ""}
        />
        <meta
          property="og:title"
          content={article.seo_title ?? article.title}
        />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="RAYYITHUN" />
        <meta
          property="og:description"
          content={article.seo_description ?? article.excerpt ?? ""}
        />
        {shareImage && <meta property="og:image" content={shareImage} />}
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={article.seo_title ?? article.title}
        />
        <meta
          name="twitter:description"
          content={article.seo_description ?? article.excerpt ?? ""}
        />
        {shareImage && <meta name="twitter:image" content={shareImage} />}
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>

      <EnglishHeader />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Main article */}
          <main className="flex-1 min-w-0">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-[#6B756E] mb-5">
              <Link to="/en" className="hover:text-[#103820]">
                Home
              </Link>
              <span>/</span>
              {article.category && (
                <>
                  <Link
                    to={`/en/${article.category.slug}`}
                    className="hover:text-[#103820]"
                  >
                    {article.category.name}
                  </Link>
                  <span>/</span>
                </>
              )}
              <span className="text-[#142820] truncate max-w-[200px]">
                {article.title}
              </span>
            </div>

            {article.is_breaking && (
              <span className="breaking-badge inline-block mb-3">
                Breaking News
              </span>
            )}

            {article.category && (
              <Link to={`/en/${article.category.slug}`}>
                <span className="category-label mb-3 block">
                  {article.category.name}
                </span>
              </Link>
            )}

            <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#142820] leading-tight mb-4 text-balance">
              {article.title}
            </h1>

            {article.excerpt && (
              <p className="text-lg text-[#6B756E] leading-relaxed mb-5 font-light border-l-4 border-[#103820] pl-4">
                {article.excerpt}
              </p>
            )}

            <div className="mb-6">
              <ArticleShareButtons title={article.title} url={canonicalUrl} />
            </div>

            {/* Featured image */}
            {article.featured_image_url && (
              <figure className="mb-8">
                <img
                  src={getArticleImageUrl(article.featured_image_url)}
                  alt={article.title}
                  className="w-full rounded-sm object-cover"
                  style={{
                    height: getArticleImageHeight(article.featured_image_url),
                    maxHeight: "70vh",
                  }}
                />
                {(article.featured_image_caption ||
                  article.featured_image_credit) && (
                  <figcaption className="mt-2 text-xs leading-relaxed text-[#6B756E]">
                    {article.featured_image_caption}
                    {article.featured_image_caption &&
                    article.featured_image_credit
                      ? " — "
                      : ""}
                    {article.featured_image_credit}
                  </figcaption>
                )}
              </figure>
            )}

            <ArticleAuthorMeta article={article} publishDate={publishDate} />
            <ArticleLiveTimeline articleId={article.id} />

            {(article.additional_image_1_url ||
              article.additional_image_2_url) && (
              <div
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"
                aria-label="Additional article images"
              >
                {[
                  {
                    url: article.additional_image_1_url,
                    credit: article.additional_image_1_credit,
                  },
                  {
                    url: article.additional_image_2_url,
                    credit: article.additional_image_2_credit,
                  },
                ]
                  .filter(
                    (image): image is { url: string; credit: string | null } =>
                      Boolean(image.url),
                  )
                  .map((image, index) => (
                    <figure
                      key={`${image.url}-${index}`}
                      className="overflow-hidden rounded-sm bg-[#E5E7E2] only:sm:col-span-2"
                    >
                      <img
                        src={getArticleImageUrl(image.url)}
                        alt={`${article.title} — image ${index + 2}`}
                        className="w-full object-cover"
                        style={{
                          height: getArticleImageHeight(image.url),
                          maxHeight: "70vh",
                        }}
                        loading="lazy"
                      />
                      {image.credit && (
                        <figcaption className="bg-white px-1 pt-2 text-xs leading-relaxed text-[#6B756E]">
                          {image.credit}
                        </figcaption>
                      )}
                    </figure>
                  ))}
              </div>
            )}

            {/* Article body */}
            <div
              className="article-content article-content-english"
              dangerouslySetInnerHTML={{
                __html: sanitizeArticleHtml(article.content),
              }}
            />
            <ArticleTags articleId={article.id} />
            <div className="mt-8">
              <ArticleShareButtons
                title={article.title}
                url={canonicalUrl}
                compact
              />
            </div>

            {/* Inline ad */}
            <div className="my-8">
              <AdBanner placement="article_inline" label="Advertisement" />
            </div>

            {/* Related articles */}
            {related && related.length > 0 && (
              <section className="mt-10 pt-8 border-t border-[#E5E7E2]">
                <h2 className="font-serif text-xl font-bold text-[#142820] mb-5">
                  Related Stories
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {related.slice(0, 4).map((a) => (
                    <ArticleCard key={a.id} article={a} variant="compact" />
                  ))}
                </div>
              </section>
            )}
            <ArticleComments articleId={article.id} />
          </main>

          {/* Sidebar */}
          <aside className="lg:w-72 flex-shrink-0 space-y-6">
            <AdBanner placement="article_sidebar" label="Advertisement" />
          </aside>
        </div>
      </div>

      <NewsletterSection portalId="00000000-0000-0000-0000-000000000002" />
      <EnglishFooter />
    </div>
  );
}
