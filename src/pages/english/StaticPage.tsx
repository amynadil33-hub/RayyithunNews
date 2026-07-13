import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { getStaticPage } from "../../services/pages.ts";
import EnglishHeader from "../../components/english/EnglishHeader.tsx";
import EnglishFooter from "../../components/english/EnglishFooter.tsx";
import { Skeleton } from "../../components/ui/skeleton.tsx";

export default function EnglishStaticPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: page, isLoading } = useQuery({
    queryKey: ["static-page", slug],
    queryFn: () => getStaticPage("english", slug!),
    enabled: !!slug,
  });

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <Helmet>
        <title>{page?.seo_title ?? page?.title ?? "Page"} — RAYYITHUN</title>
        {page?.seo_description && <meta name="description" content={page.seo_description} />}
      </Helmet>
      <EnglishHeader />

      <div className="max-w-3xl mx-auto px-4 py-12">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-1/2" />
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
          </div>
        ) : page ? (
          <>
            <h1 className="font-serif text-3xl font-bold text-[#142820] mb-8 pb-4 border-b-2 border-[#103820]">
              {page.title}
            </h1>
            <div
              className="article-prose prose prose-lg max-w-none
                prose-headings:font-serif prose-headings:text-[#142820]
                prose-p:text-[#142820] prose-a:text-[#103820]"
              dangerouslySetInnerHTML={{ __html: page.content ?? "" }}
            />
          </>
        ) : (
          <div className="text-center py-20">
            <h1 className="font-serif text-2xl font-bold text-[#142820]">Page Not Found</h1>
          </div>
        )}
      </div>

      <EnglishFooter />
    </div>
  );
}
