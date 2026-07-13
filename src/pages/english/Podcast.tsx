import { Helmet } from "react-helmet-async";
import { PlayCircleIcon } from "lucide-react";
import EnglishHeader from "../../components/english/EnglishHeader.tsx";
import EnglishFooter from "../../components/english/EnglishFooter.tsx";
import NewsletterSection from "../../components/shared/NewsletterSection.tsx";
import { usePodcasts } from "../../hooks/use-portal-data.ts";
import { Skeleton } from "../../components/ui/skeleton.tsx";
import { format } from "date-fns";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "../../components/ui/empty.tsx";

export default function EnglishPodcast() {
  const { data: podcasts, isLoading } = usePodcasts("english", 20);

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <Helmet>
        <title>Podcast — RAYYITHUN</title>
        <meta name="description" content="Listen to RAYYITHUN podcast episodes about Maldivian society, business, and culture." />
      </Helmet>
      <EnglishHeader />

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="border-b-2 border-[#103820] pb-3 mb-8">
          <h1 className="font-serif text-3xl font-bold text-[#142820]">Podcast</h1>
          <p className="text-[#6B756E] mt-1 text-sm">Conversations about the Maldives — society, culture, business, and change.</p>
        </div>

        {isLoading ? (
          <div className="space-y-5">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
          </div>
        ) : podcasts && podcasts.length > 0 ? (
          <div className="space-y-4">
            {podcasts.map((podcast, i) => (
              <div key={podcast.id} className="bg-white border border-[#E5E7E2] rounded-sm p-5 flex gap-5 hover:shadow-sm transition-shadow">
                {podcast.cover_image_url ? (
                  <img src={podcast.cover_image_url} alt={podcast.title}
                    className="w-24 h-24 object-cover rounded-sm flex-shrink-0" loading="lazy" />
                ) : (
                  <div className="w-24 h-24 bg-[#D8E8D8] rounded-sm flex-shrink-0 flex items-center justify-center">
                    <span className="font-serif text-[#103820] text-2xl font-bold">{i + 1}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#6B756E] mb-1">Episode {podcasts.length - i}</p>
                  <h3 className="font-serif font-semibold text-[#142820] text-lg leading-snug mb-1">{podcast.title}</h3>
                  {podcast.description && (
                    <p className="text-sm text-[#6B756E] leading-relaxed line-clamp-2 mb-3">{podcast.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-[#6B756E]">
                    {podcast.host && <span>{podcast.host}</span>}
                    {podcast.duration && (
                      <span className="flex items-center gap-1">
                        <PlayCircleIcon size={12} />
                        {podcast.duration}
                      </span>
                    )}
                    {podcast.published_at && (
                      <span>{format(new Date(podcast.published_at), "d MMM yyyy")}</span>
                    )}
                  </div>
                </div>
                <button className="flex-shrink-0 w-10 h-10 rounded-full bg-[#103820] flex items-center justify-center hover:bg-[#183028] transition-colors" aria-label="Play episode">
                  <PlayCircleIcon size={20} className="text-white" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon"><PlayCircleIcon /></EmptyMedia>
              <EmptyTitle>No episodes yet</EmptyTitle>
              <EmptyDescription>Podcast episodes will appear here.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>

      <NewsletterSection portalId="00000000-0000-0000-0000-000000000002" />
      <EnglishFooter />
    </div>
  );
}
