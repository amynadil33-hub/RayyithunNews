import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { getArticleBySlug, getRelatedArticles } from "../../services/articles.ts";
import EnglishHeader from "../../components/english/EnglishHeader.tsx";
import EnglishFooter from "../../components/english/EnglishFooter.tsx";
import ArticleCard from "../../components/english/ArticleCard.tsx";
import AdBanner from "../../components/shared/AdBanner.tsx";
import NewsletterSection from "../../components/shared/NewsletterSection.tsx";
import { Skeleton } from "../../components/ui/skeleton.tsx";
import { format } from "date-fns";
import { ClockIcon, UserIcon, CalendarIcon, ShareIcon } from "lucide-react";

export default function EnglishArticle() {
  const { slug } = useParams<{ slug: string }>();

  const { data: article, isLoading } = useQuery({
    queryKey: ["article", "english", slug],
    queryFn: () => getArticleBySlug("english", slug!),
    enabled: !!slug,
  });

  const { data: related } = useQuery({
    queryKey: ["related", article?.id],
    queryFn: () => getRelatedArticles(article!.id, article!.category_id!, article!.portal_id),
    enabled: !!article?.category_id,
  });

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = article?.title ?? "";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F8F8]">
        <EnglishHeader />
        <div className="max-w-4xl mx-auto px-4 py-10 space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="w-full h-72" />
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
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
          <h1 className="font-serif text-3xl font-bold text-[#142820] mb-4">Article Not Found</h1>
          <Link to="/en" className="text-[#103820] underline">← Back to home</Link>
        </div>
        <EnglishFooter />
      </div>
    );
  }

  const publishDate = article.published_at
    ? format(new Date(article.published_at), "d MMMM yyyy")
    : "";

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <Helmet>
        <title>{article.seo_title ?? article.title} — RAYYITHUN</title>
        <meta name="description" content={article.seo_description ?? article.excerpt ?? ""} />
        <meta property="og:title" content={article.seo_title ?? article.title} />
        <meta property="og:description" content={article.seo_description ?? article.excerpt ?? ""} />
        {(article.og_image_url ?? article.featured_image_url) && (
          <meta property="og:image" content={article.og_image_url ?? article.featured_image_url!} />
        )}
        <meta property="og:type" content="article" />
      </Helmet>

      <EnglishHeader />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Main article */}
          <main className="flex-1 min-w-0">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-[#6B756E] mb-5">
              <Link to="/en" className="hover:text-[#103820]">Home</Link>
              <span>/</span>
              {article.category && (
                <>
                  <Link to={`/en/${article.category.slug}`} className="hover:text-[#103820]">
                    {article.category.name}
                  </Link>
                  <span>/</span>
                </>
              )}
              <span className="text-[#142820] truncate max-w-[200px]">{article.title}</span>
            </div>

            {article.is_breaking && (
              <span className="breaking-badge inline-block mb-3">Breaking News</span>
            )}

            {article.category && (
              <Link to={`/en/${article.category.slug}`}>
                <span className="category-label mb-3 block">{article.category.name}</span>
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

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-[#6B756E] mb-6 pb-5 border-b border-[#E5E7E2]">
              {article.author?.full_name && (
                <span className="flex items-center gap-1">
                  <UserIcon size={14} />
                  {article.author.full_name}
                </span>
              )}
              {publishDate && (
                <span className="flex items-center gap-1">
                  <CalendarIcon size={14} />
                  {publishDate}
                </span>
              )}
              {article.read_time && (
                <span className="flex items-center gap-1">
                  <ClockIcon size={14} />
                  {article.read_time} min read
                </span>
              )}
              {/* Share buttons */}
              <div className="ml-auto flex items-center gap-2">
                <span className="flex items-center gap-1 text-xs text-[#6B756E]"><ShareIcon size={13} /> Share</span>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#6B756E] hover:text-[#1877F2] transition-colors text-xs font-bold"
                  aria-label="Share on Facebook"
                >
                  f
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#6B756E] hover:text-[#1DA1F2] transition-colors text-xs font-bold"
                  aria-label="Share on Twitter"
                >
                  𝕏
                </a>
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + " " + shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#6B756E] hover:text-[#25D366] transition-colors text-xs font-bold"
                  aria-label="Share on WhatsApp"
                >
                  WA
                </a>
              </div>
            </div>

            {/* Featured image */}
            {article.featured_image_url && (
              <figure className="mb-8">
                <img
                  src={article.featured_image_url}
                  alt={article.title}
                  className="w-full rounded-sm object-cover max-h-[480px]"
                />
              </figure>
            )}

            {(article.additional_image_1_url || article.additional_image_2_url) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8" aria-label="Additional article images">
                {[article.additional_image_1_url, article.additional_image_2_url]
                  .filter((imageUrl): imageUrl is string => Boolean(imageUrl))
                  .map((imageUrl, index) => (
                    <figure key={`${imageUrl}-${index}`} className="overflow-hidden rounded-sm bg-[#E5E7E2]">
                      <img
                        src={imageUrl}
                        alt={`${article.title} — image ${index + 2}`}
                        className="w-full h-full min-h-64 max-h-96 object-cover"
                        loading="lazy"
                      />
                    </figure>
                  ))}
              </div>
            )}

            {/* Article body */}
            <div
              className="article-prose prose prose-lg max-w-none
                prose-headings:font-serif prose-headings:text-[#142820]
                prose-p:text-[#142820] prose-p:leading-[1.85]
                prose-a:text-[#103820] prose-a:underline
                prose-img:rounded-sm prose-blockquote:border-l-[#103820]"
              dangerouslySetInnerHTML={{ __html: article.content ?? "" }}
            />

            {/* Inline ad */}
            <div className="my-8">
              <AdBanner placement="article_inline" label="Advertisement" />
            </div>

            {/* Related articles */}
            {related && related.length > 0 && (
              <section className="mt-10 pt-8 border-t border-[#E5E7E2]">
                <h2 className="font-serif text-xl font-bold text-[#142820] mb-5">Related Stories</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {related.slice(0, 4).map((a) => (
                    <ArticleCard key={a.id} article={a} variant="compact" />
                  ))}
                </div>
              </section>
            )}
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
